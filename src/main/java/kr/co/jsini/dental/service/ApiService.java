package kr.co.jsini.dental.service;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Timestamp;
import java.sql.Types;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;
import java.util.List;
import java.util.Locale;

import org.apache.tomcat.util.json.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import kr.co.jsini.dental.dto.ApiInfo;
import kr.co.jsini.dental.dto.ProcInfo;
import kr.co.jsini.dental.dto.TblInfo;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ApiService {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  ApiInfo getCallProcName(Map<String, String> params) {

    ApiInfo apiinfo = new ApiInfo();
    apiinfo.setSequence(-1);

    // 프로시저명과 파라미터 구하기.
    String pname = params.get("p"); // 프로시저 명
    if (pname == null) {
      apiinfo.setErrCode(-3);
      apiinfo.setErrMsg("p param Not Found");
      return apiinfo;
    }
    String[] pnames = pname.split("\\.");

    String m_schemaName = "sm" + pnames[0];
    String m_packageName = "p_" + pnames[1];
    String m_procedureName = "" + pnames[2];

    String procName = "CALL " + m_schemaName + "." + m_packageName + "_" + m_procedureName + "( ";

    String query = " "
        + "  select a.specific_schema as package_name                    "
        + "		, a.specific_name as procedure_name                     "
        + "		, case when substr(a.parameter_name,1,2) = 'p_' "
        + "             then substr(a.parameter_name,3) "
        + "		       else a.parameter_name "
        + "	            end "
        + "               as ARGUMENT_NAME"
        + "		,a.data_type as DATA_TYPE"
        + "		,a.parameter_mode as IN_OUT"
        + "		,a.ordinal_position as SEQUENCE"
        + "	 from information_schema.parameters a "
        + "	where 1=1"
        // +" and a.specific_schema = ? "
        + "	  and a.specific_name ~ ('(\\m' || ? || '_\\d{1,})')";

    List<ProcInfo> list = jdbcTemplate.query(query, new BeanPropertyRowMapper(ProcInfo.class),
        m_packageName + "_" + m_procedureName);

    String aguments = "";
    for (ProcInfo pi : list) {
      pi.setBindValue(params.get(pi.getArgument_name()));
      if (aguments.trim().equals("")) {
        aguments += " ?";
      } else {
        aguments += ", ?";
      }
    }

    procName += aguments + " )";

    apiinfo.setScima_name(m_schemaName);
    apiinfo.setPackage_name(m_packageName);
    apiinfo.setProcedule_name(m_procedureName);

    apiinfo.setProceStr(procName);


    apiinfo.setPis(list);



    
    String tbl_jsonStr = params.get("TBL_DATA");
    
    log.info("tbl_jsonStr {}", tbl_jsonStr);
    
    if(tbl_jsonStr == null){
      
    }
    else{
      JsonArray tblArr = (JsonArray) JsonParser.parseString(tbl_jsonStr);

      List<TblInfo> tbls = new ArrayList<TblInfo>();

      log.info("jobj {}", tblArr);

      for(JsonElement je : tblArr){
        TblInfo tbl = new TblInfo();        
        //log.info("je : {}", je);
        
        HashMap<String, String> hm = new HashMap<String, String>();
        JsonObject jj = (JsonObject)je;  
        for( Map.Entry<String, JsonElement> jobj : jj.entrySet() ){
    
        //log.info("jobj : {}", jobj);
        //log.info("jobj getKey: {}", jobj.getKey());
        //log.info("jobj getValue: {}", jobj.getValue());
        //hm.put(jobj.getKey(), jobj.getValue().toString());
        hm.put(jobj.getKey(), jobj.getValue().getAsString());
        }
        
        tbl.setArguments(hm); 

        tbls.add(tbl);
      } 

      apiinfo.setTbl_list(tbls);
    }

    return apiinfo;
  }


  public JsonObject getProjectInfo(Map<String, String> params) {


    Date startDt = new Date();

    // 프로시저명과 파라미터 구하기.
    JsonObject jo = new JsonObject();
    ApiInfo apiInfo = getCallProcName(params);

    if (apiInfo.getErrCode() < 0) {

    } 
    else {

      Connection con = null;
      CallableStatement cc = null;
      ResultSet rs = null;

      String sess_userid = "";
      String sess_id = "";

      try {
        con = jdbcTemplate.getDataSource().getConnection();
        con.setAutoCommit(false);

        log.info("prepareCall : {}", apiInfo.getProceStr());
        cc = con.prepareCall(apiInfo.getProceStr());

        List<TblInfo> tbllist = apiInfo.getTbl_list();
        if( tbllist != null  ){ //tbl list 가 존재할때

          for( TblInfo tbl : tbllist ){

            log.info("TblInfo : {}",tbl);
            log.info("TblInfo hashmap: {}",tbl.getArguments()); 
            HashMap<String, String> hm = tbl.getArguments();
            int i = 0;
            log.info("procinfo loop ---------------------------------------------------------");
            for (ProcInfo p : apiInfo.getPis()) {
              

              if (p.getIn_out().equals("INOUT") && p.getData_type().equals("refcursor") ) {
                log.info("{}.(g) {} : {}",(i + 1), p.getArgument_name(), p.getData_type());
                //cc.setObject((i + 1), null);
                      cc.setNull(   (i+1), Types.REF_CURSOR   );
                cc.registerOutParameter((i + 1), Types.REF_CURSOR);
                apiInfo.setSequence(i + 1);
                
                    //log.info("cc registerOutParameter :{} , REF_CURSOR",(i + 1) ); 

              } 
              else if (p.getIn_out().equals("INOUT")  ) {
                log.info("{}.(g_n) {} : null", (i + 1), p.getArgument_name());
                //cc.setObject((i + 1), null);
                cc.setNull(   (i+1), Types.VARCHAR   );
                cc.registerOutParameter((i + 1), Types.VARCHAR);
                //apiInfo.setSequence(i + 1);
                
                    //log.info("cc registerOutParameter :{} , REF_CURSOR",(i + 1) ); 

              }               
              else {
                //log.info("procInfo i : {}, {}",(i+1), p.getArgument_name()); 
                if (p.getArgument_name().toLowerCase().equals("sess_userid")) {
                  cc.setObject((i + 1), sess_userid);
                } else if (p.getArgument_name().toLowerCase().equals("sess_id")) {
                  cc.setObject((i + 1), sess_id);
                } else {
                  if( hm.get(p.getArgument_name().toLowerCase()) != null ){
                    cc.setObject((i + 1), hm.get(p.getArgument_name().toLowerCase()));
                    log.info("{}.(t) {} : {}",(i + 1),p.getArgument_name(), hm.get(p.getArgument_name().toLowerCase()) );   
                  }
                  else{

                    if( p.getBindValue() != null && !p.getBindValue().equals("") ){ // json 외 파라미터로 들어 온것 체크 하고 그래도 없으면 null 처리
                      cc.setObject((i+1), p.getBindValue());
                    log.info("{}.(p) {} : {}",(i + 1),p.getArgument_name(), p.getBindValue() ); 
                    } 
                    else{           
                      cc.setNull(   (i+1), Types.VARCHAR   );
                    log.info("{}.(p_n) {} : {}",(i + 1),p.getArgument_name(), p.getBindValue() ); 
                    }

                    //cc.setObject((i + 1), p.getBindValue());  
                  }
                }
              }
              i++;
            }

            log.info("before tbl execute");
            cc.execute();
            log.info("after tbl execute");

            i = 0;
            log.info("return aguments check ---------------------------------------------------------");
            HashMap<String, String> rhm = new HashMap<String, String>();
            for (ProcInfo p : apiInfo.getPis()) {
              if (p.getIn_out().equals("INOUT") && !p.getData_type().equals("refcursor") ) {
                
                log.info("rhm xxxx : {} , {} ", (i+1), p.getArgument_name());

                String resultStr = cc.getString((i+1));
                rhm.put(p.getArgument_name(), resultStr);

                log.info("rhm : {} ", rhm);

              }
              i++;
            }
            tbl.setReturnArguments(rhm);


          }
          
          log.info("end tbl loop");

        }
        else{
          
          int i = 0;
          for (ProcInfo p : apiInfo.getPis()) {
            log.info("procinfo loop ---------------------------------------------------------");

            if (p.getIn_out().equals("INOUT") && p.getData_type().equals("refcursor") ) {
              log.info("inout found : {}, {}", p, p.getData_type());
              cc.setObject((i + 1), null);
              cc.registerOutParameter((i + 1), Types.REF_CURSOR);
              apiInfo.setSequence(i + 1);
            } else {
              if (p.getArgument_name().toLowerCase().equals("sess_userid")) {
                cc.setObject((i + 1), sess_userid);
              } else if (p.getArgument_name().toLowerCase().equals("sess_id")) {
                cc.setObject((i + 1), sess_id);
              } else {
                cc.setObject((i + 1), p.getBindValue());
              }
            }
            i++;
          }

          log.info("before execute");
          cc.execute();

        }

        log.info("apiInfo.getSequence() : {}", apiInfo.getSequence());
        if( apiInfo.getSequence() >= 0 ){ // 리턴 커스가 존재할때
          rs = cc.getObject(apiInfo.getSequence(), ResultSet.class);
          log.info("rs {}", rs);

          
          List rslist = convertList(rs);

          jo.addProperty("excuteRowCnt", rslist.size());

          JsonArray data_jobj = (JsonArray) JsonParser.parseString(new Gson().toJson(rslist));

          jo.add("data", data_jobj);

          log.info("data load ");

        }
        else{
          jo.add("data", new JsonArray());
        }

        log.info("setAutoCommit true "); 
        con.setAutoCommit(true);


      } catch (Exception eeee) {

        log.info("eeee {}", eeee + "");
        apiInfo.setErrCode(-1);
        apiInfo.setErrMsg("DAO Fail");
        apiInfo.setErrMsgDesc(eeee + "");
      } finally {

        try {

          if (rs != null) {
            rs.close();
          }
          if (cc != null) {
            cc.close();
          }
          if (con != null) {
            con.close();
          }

        } catch (Exception eeeee) {

        }

      }


    
    }

    jo.addProperty("createdDate", new SimpleDateFormat("HHmmss", new Locale("KOREAN", "KOREA")).format(new Date()));

    Date endDt = new Date();

    // Date -> 밀리세컨즈
    long timeMil1 = startDt.getTime();
    long timeMil2 = endDt.getTime();

    // 시간차 밀리세컨초
    long diff = timeMil2 - timeMil1;

    jo.addProperty("exectime", diff);

    JsonObject jobj = (JsonObject) JsonParser.parseString(new Gson().toJson(apiInfo));
    jo.add("piinfo", jobj);
    jo.addProperty("code", apiInfo.getErrCode());
    jo.addProperty("message", apiInfo.getErrMsgDesc());


    return jo;
  }

  protected List<?> convertList(ResultSet paramResultSet) {
    // String key = m_req.getParameter("k");
    // String value = m_req.getParameter("v");
    ArrayList<Hashtable<Object, Object>> arrayList = null;
    if (paramResultSet == null) {
      arrayList = new ArrayList();
      return arrayList;
    }
    try {
      int i = paramResultSet.getRow();
      ResultSetMetaData resultSetMetaData = paramResultSet.getMetaData();
      int j = resultSetMetaData.getColumnCount();
      String str = "";
      Object object = null;
      if (i > -1) {
        arrayList = new ArrayList();
        byte b = 0;
        while (paramResultSet.next()) {
          b++;
          Hashtable<Object, Object> hashtable = new Hashtable<>();
          for (byte b1 = 1; b1 <= j; b1++) {
            str = resultSetMetaData.getColumnName(b1).toLowerCase();
            object = paramResultSet.getObject(b1);
            if (isNull(object)) {
              object = "";
            } else if (object instanceof Timestamp) {
              Timestamp timestamp = (Timestamp) object;
              object = timestamp;
            }
            hashtable.put(str, object);

            /*
             * if( str.equals(key)){
             * hashtable.put("value", object);
             * //System.out.println(str +"________________________"+key);
             * }
             * else if( str.equals(value)){
             * hashtable.put("label", object);
             * }
             */

          }
          hashtable.put("tbl_cb", ""); // I, U, D
          arrayList.add(hashtable);
        }
      }
    } catch (Exception exception) {
      exception.printStackTrace();
      // displayError(exception);
    }
    return arrayList;
  }

  protected boolean isNull(Object paramObject) {
    return (paramObject == null || "".equals(paramObject));
  }

}

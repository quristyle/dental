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


    String tbl_jsonStr = params.get("TBL_DATA");
    
      log.info("tbl_jsonStr {}", tbl_jsonStr);
    
    if(tbl_jsonStr == null){
      //objs = new Object[1];
      //objs[0] = null;
    }
    else{
      JsonArray tblArr = (JsonArray) JsonParser.parseString(tbl_jsonStr);

      log.info("jobj {}", tblArr);

      for(JsonElement je : tblArr){
        log.info("je : {}", je);
      }

      //JsonObject tblArr2 = (JsonObject) JsonParser.parseString(tbl_jsonStr);

      //log.info("jobj2 {}", tblArr2);

      //JSONParser parser = new JSONParser();
      //Object obj = parser.parse( tbl_jsonStr );
      //JSONArray jsonArr = (JSONArray) obj;

      //objs = jsonArr.toArray();

      //for (int i = 0 ; i < objs.length; i++) {
        //JSONObject jobj = (JSONObject)(objs[i]);

      //}


    }


    apiinfo.setPis(list);

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

        int i = 0;
        for (ProcInfo p : apiInfo.getPis()) {
          if (p.getIn_out().equals("INOUT") && p.getData_type().equals("refcursor") ) {
            log.info("inout found : {}", p);
            log.info("inout datatype : {}", p.getData_type());
            cc.setObject((i + 1), null);
            cc.registerOutParameter((i + 1), Types.REF_CURSOR);
            apiInfo.setSequence(i + 1);
          } else {
            // System.out.println("getParam xx: "+p.getParam().toLowerCase());
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

        if( apiInfo.getSequence() >= 0 ){
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

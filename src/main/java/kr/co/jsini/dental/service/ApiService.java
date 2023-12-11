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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import kr.co.jsini.dental.dto.proc_info;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ApiService {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  List<proc_info> getCallProcName( Map<String, String> params, String procName ){

    // 프로시저명과 파라미터 구하기.
    String pname = params.get("p"); // 프로시저 명
    String[] pnames = pname.split("\\.");

		String m_schemaName = "sm"+pnames[0] ;
		String m_packageName = "p_"+pnames[1] ;
		String m_procedureName = ""+pnames[2] ;

		procName = "CALL "+ m_schemaName +"."+m_packageName +"_"+ m_procedureName+"( " ;

    
    String query = " "
    +"  select a.specific_schema as package_name                    "                                                          
    +"		, a.specific_name as procedure_name                     "
    +"		, case when substr(a.parameter_name,1,2) = 'p_' "
    +"             then substr(a.parameter_name,3) "
    +"		       else a.parameter_name "
    +"	            end "
    +"               as ARGUMENT_NAME"
    +"		,a.data_type as DATA_TYPE"
    +"		,a.parameter_mode as IN_OUT"
    +"		,a.ordinal_position as SEQUENCE"
    +"	 from information_schema.parameters a "
    +"	where 1=1"
    //+"	  and a.specific_schema = ? "
    +"	  and a.specific_name ~ ('(\\m' || ? || '_\\d{1,})')"
    ;

    List<proc_info> list = jdbcTemplate.query(query, new BeanPropertyRowMapper(proc_info.class), m_packageName+"_"+m_procedureName);

    String aguments = "";
    for(proc_info pi : list){
      pi.setBindValue( params.get(pi.getArgument_name()) ); 
				if( aguments.trim().equals("")){
					aguments += " ?";
				}
				else{
					aguments += ", ?";
				}
    }

	  procName += aguments+ " )" ;
    return list;
  }

  public JsonObject getProjectInfo(Map<String, String> params) {

    Date startDt = new Date();
    int errCode = 0;
    String errMsg = "success" ;
    String errMsgDesc = "";

    // 프로시저명과 파라미터 구하기.
    String m_procName =null;
    JsonObject jo = new JsonObject();
    List<proc_info> list = getCallProcName(params, m_procName);
    // String pname = params.get("p"); // 프로시저 명
    // String[] pnames = pname.split("\\.");

		// String m_schemaName = "sm"+pnames[0] ;
		// String m_packageName = "p_"+pnames[1] ;
		// String m_procedureName = ""+pnames[2] ;

		// String m_procName = "CALL "+ m_schemaName +"."+m_packageName +"_"+ m_procedureName+"( " ;


    //log.info("pname : {}", pname);

    //log.info("m_packageName : {}", m_packageName);
    //log.info("m_procedureName : {}", m_procedureName);
    //log.info("m_procName : {}", m_procName);
/*
    String query = " "
    +"  select a.specific_schema as package_name                    "                                                          
    +"		, a.specific_name as procedure_name                     "
    +"		, case when substr(a.parameter_name,1,2) = 'p_' "
    +"             then substr(a.parameter_name,3) "
    +"		       else a.parameter_name "
    +"	            end "
    +"               as ARGUMENT_NAME"
    +"		,a.data_type as DATA_TYPE"
    +"		,a.parameter_mode as IN_OUT"
    +"		,a.ordinal_position as SEQUENCE"
    +"	 from information_schema.parameters a "
    +"	where 1=1"
    //+"	  and a.specific_schema = ? "
    +"	  and a.specific_name ~ ('(\\m' || ? || '_\\d{1,})')"
    ;

    //List<Map<String, Object>> list =  jdbcTemplate.queryForList(query, proc_info.class, m_packageName+"_"+m_procedureName);
    List<proc_info> list = jdbcTemplate.query(query, new BeanPropertyRowMapper(proc_info.class), m_packageName+"_"+m_procedureName);

    //log.info("List --> : {}", list);

    String aguments = "";
    for(proc_info pi : list){
    //for(Map<String, Object> map : list){
      //proc_info pi = new proc_info();
      //pi.seta map.get("argument_name");
      pi.setBindValue( params.get(pi.getArgument_name()) ); // 넘어온 파라미터 값을 반영한다.
      //log.info("pi {}", pi);
				if( aguments.trim().equals("")){
					aguments += " ?";
				}
				else{
					aguments += ", ?";
				}
    }

	  m_procName += aguments+ " )" ;

    log.info("m_procName : {}", m_procName);

*/

    Connection con = null;
CallableStatement cc = null;
ResultSet rs = null;

String sess_userid = "";
String sess_id = "";

try{
     con = jdbcTemplate.getDataSource().getConnection();
     con.setAutoCommit(false);

     log.info(" prepareCall : {}", m_procName);
 cc = con.prepareCall(m_procName);

 int i = 0;
 for(proc_info p : list){
  if( p.getIn_out().equals("INOUT")){
    p.setCc_seq((i+1)+"");
    cc.setObject((i+1), null);
    cc.registerOutParameter((i+1), Types.REF_CURSOR);
  }
  else{
    //System.out.println("getParam xx: "+p.getParam().toLowerCase());
    if(p.getArgument_name().toLowerCase().equals("sess_userid")){
      cc.setObject((i+1), sess_userid);
    p.setCc_seq((i+1)+"");
    }
    else if(p.getArgument_name().toLowerCase().equals("sess_id")){
      cc.setObject((i+1), sess_id);
    p.setCc_seq((i+1)+"");
    }
    else{
      cc.setObject((i+1), p.getBindValue());
    p.setCc_seq((i+1)+"");
    }
  }
  i++;
}

cc.execute();

int pcnt = list.size();

				rs = cc.getObject( pcnt, ResultSet.class);

				con.setAutoCommit(true);
  log.info("rs {}", rs);


  List rslist = convertList(rs);

  
    JsonArray data_jobj = (JsonArray)JsonParser.parseString(new Gson().toJson(rslist));

    jo.add("data", data_jobj);




}
catch(Exception eeee){

  log.info("eeee {}", eeee+"");
  errCode = -1;
  errMsg = "DAO fail";
  errMsgDesc = eeee+"";
}
finally {

  try{
    
    if(rs != null ){ rs.close(); }
    if(cc != null ){ cc.close(); }
    if(con != null ){ con.close(); }
    
  }
  catch(Exception eeeee){

  }
  

}




    jo.addProperty("code", errCode);
    jo.addProperty("desc", errMsg);
    jo.addProperty("detail", errMsgDesc);




    jo.addProperty("outputExsit", true);
    jo.addProperty("excuteRowCnt", list.size());	
    jo.addProperty("pstr", m_procName);

		jo.addProperty("projectName", "preword");
		jo.addProperty("author", "hello-bryan");
		jo.addProperty("createdDate", new SimpleDateFormat("HHmmss", new Locale("KOREAN", "KOREA")).format(new Date()));

	

    Date endDt = new Date();

    	
    		// Date -> 밀리세컨즈 
    		long timeMil1 = startDt.getTime();
    		long timeMil2 = endDt.getTime();
			
    		// 비교 
    		long diff = timeMil2 - timeMil1;
			
    		long diffSec = diff /1000;

    jo.addProperty("exectime", diff);

    JsonArray jobj = (JsonArray)JsonParser.parseString(new Gson().toJson(list));

    jo.add("piinfo", jobj);

		return jo;
	}







protected List<?> convertList(ResultSet paramResultSet) {
	//String key = m_req.getParameter("k");
	//String value = m_req.getParameter("v");
ArrayList<Hashtable<Object, Object>> arrayList = null;
if(paramResultSet == null ){ 
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
Timestamp timestamp = (Timestamp)object;
object = timestamp;
} 
hashtable.put(str, object);

/*
if( str.equals(key)){
	hashtable.put("value", object);
//System.out.println(str +"________________________"+key);
}
else if( str.equals(value)){
	hashtable.put("label", object);
}
*/

} 
hashtable.put("tbl_cb", ""); // I, U, D
arrayList.add(hashtable);
} 
} 
} catch (Exception exception) {
exception.printStackTrace();
//displayError(exception);
} 
return arrayList;
}






protected  boolean isNull(Object paramObject) {
  return (paramObject == null || "".equals(paramObject));
  }

















}

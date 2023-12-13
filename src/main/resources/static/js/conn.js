_baseGoin = '/temps/default_user.png';
_baseGoin_m = '/temps/user_profile.png';
_baseGoin_w = '/temps/user_profile_w.png';


function search(pnm, formid, prams, fn_callback, isSync){
  var result = null;
  if( isSync == undefined || isSync == null ){ isSync = true;}
  //var pQuery = getParamStr(pnm, formid, prams);
	

  //var fid = $("form[name='"+formid+"'");
  //var postDataPram = fid.serializeArray();


  var postDataPram = serialize("form[name='"+formid+"'");

	if( !isempty(prams)){
    postDataPram += '&'+prams;
	}
  $.ajax({
		url : '/fr3.jsp?p='+pnm
        , type : 'post'
        , async: isSync
        , data : postDataPram
        , datatype : "json"
        , timeout: 100000
        , beforesend:function(){}
        , complete:function(){}
        , success : function(data, a, b){   
            console.log( data );            
            if( data.piinfo.errCode < 0 ){
              showAlert('danger',data.result.desc , true);
            }
            else{
              if( fn_callback ){
                fn_callback( data.data );
              } 
              result = data.data;
            }
          }  
        , error : function(request,status,error){
            showAlert('danger',"code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error, true );
            //alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
          }
        , fail : function() {
            showAlert('danger',"상태를 확인필요.", true);
          }
  });
  return result;
}

function excute(pnm, formid, prams, fn_callback, isSync){
  var result = null;
  if( isSync == undefined || isSync == null ){ isSync = true;}
  //var pQuery = getParamStr(pnm, formid, prams);

  var postDataPram = '';
	if(!isempty(formid)){
		//var fid = $("form[name='"+formid+"'");
		//postDataPram = fid.serializeArray();

    $("form[name='"+formid+"'").find('select').removeAttr("disabled");
    postDataPram = serialize("form[name='"+formid+"'");
    $("form[name='"+formid+"'").find('.disshow').attr("disabled", "disabled");

    console.log('postDataPram', postDataPram);

		if( prams != null){
			postDataPram.push({name:'TBL_DATA', value:JSON.stringify(prams)});
			//postDataPram = "&TBL_DATA="+encodeURIComponent(JSON.stringify(prams));
		}
		
		//postDataPram += '&';
	}
	else{
		if( prams != null){
			postDataPram = "TBL_DATA="+encodeURIComponent(JSON.stringify(prams));
		}
	}

  $.ajax({
				url : '/api?p='+pnm
        , type : 'post'
        , async: isSync
        , data : postDataPram
        , datatype : "json"
        , timeout: 100000
        , beforesend:function(){}
        , complete:function(){}
        , success : function(data, a, b){   
            console.log( data );
            
            if( data.piinfo.errCode < 0 ){
              //alert( data.result.desc);

              //var alert_div = '<div class="alert alert-danger alert-dismissable fade show"><button class="close" data-dismiss="alert">&times;</button>'+data.result.desc+'&nbsp;&nbsp;&nbsp;</div>';

              //$('.alert_container').append(alert_div);

              console.log('error :', data.result);
              console.log('error detail:', data.result.detail);
              showAlert('danger',data.result.desc , true);

              // if( fn_callback ){
              //   fn_callback( data );
              // } 

            }
            else{
              result = data;
            }
            if( fn_callback ){
              fn_callback( data );
            } 
          }  
        , error : function(request,status,error){
            if(request.status == 0){
              //showAlert('danger',"code:"+request.status+"\n"+"message:심각한 오류\nerror:"+error, true );
            }
            else if(request.status >= 300){
              //showAlert('danger',"code:"+request.status+"\n"+"message:심각한 오류\nerror:"+error, true );
            }
            else{
              showAlert('danger',""+request.responseText+" "+"error:"+error, true );
            }
            //alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
          }
        , fail : function() {
            showAlert('danger',"상태를 확인필요.", true);
          }
  });
  return result;
}

function serialize(sel) {
  var arr,
      tmp,
      i,
      $nodes = $(sel);

  // 1. collect form controls
  $nodes = $nodes.map(function(ndx){
     var $n = $(this);

     if($n.is('form'))
        return $n.find('input, select, textarea').get();
     return this;
   });

  // 2. replace empty values of <input>s of type=["checkbox"|"radio"] with 1 
  // or, we end up with "on" when checked
  $nodes.each(function(ndx, el){
     if ((el.nodeName.toUpperCase() == 'INPUT') && ((el.type.toUpperCase() == 'CHECKBOX') || (el.type.toUpperCase() == 'RADIO'))){
        if((el.value === undefined) || (el.value == ''))
           el.value = 1;
     }
  });

  // 3. produce array of objects: {name: "field attribute name", value: "actual field value"}
  arr = $nodes.serializeArray();
  tmp = [];
  for(i = 0; i < arr.length; i++)
     tmp.push(arr[i].name);

  // 4. include unchecked checkboxes
   $nodes.filter('input[type="checkbox"]:not(:checked)').each(function(){
     if(tmp.indexOf(this.name) < 0){
        arr.push({name: this.name, value: ''});
     }
   });

  return arr;
}

function exsit_val (val){  
  if( val == null || val == undefined){ 
    return false;
  }
  return true;
}


function isempty (val){  
  if( val == '' || !exsit_val(val)){ 
    return true;
  }
  return false;
}

function getval (val){  
  if( val == '' || !exsit_val(val)){ 
    return '';
  }
  return val;
}

function nvl (val, changeStr){  
  if( val == '' || !exsit_val(val)){ 
    return changeStr;
  }
  return val;
}


function nvl2 (val, changeStr, changeStr2){  
  if( val == '' || !exsit_val(val)){ 
    return changeStr;
  }
  return changeStr2;
}


function nvl3 (val, val2, equalstr, changeStr, changeStr2){  
  if( val == '' || !exsit_val(val)){ 
    //return changeStr2;
    return (val2 == equalstr)?changeStr:changeStr2;
  }
  //else{
  // return (val == equalstr)?changeStr:changeStr2;
  //}
  return val;
}



function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};



// iframe 안의 메시지
function showAlert( alertType, message, isFiexd) {
  
  var msg = {alertType:alertType, message:message, isFiexd:isFiexd};
  try{
  f_actionFn(parent, 'showAlert2', msg);
  }
  catch(ee){
    showAlert2(msg);
  }
  return;
  var alertId = 'alert_'+generateUUID();

  //console.log('showAlert', alertId);

  var alert_container = $('.alert_container');
  if(alert_container.length <= 0){
    
    //console.log('showAlert alert_container 찾지 못함 :', alertId);

    alert_container = $('.alert_container', parent.document);
  }

  alert_container.append('<div class="alert alert-' + alertType + '" id="' + alertId + '">' + message + '&nbsp;&nbsp;&nbsp;<button class="close" data-dismiss="alert">&times;</button></div>');

  $("#" + alertId).alert();
	//$("#" + alertId).modal('show');
  if( isFiexd ){

    //console.log('showAlert isFiexd :', isFiexd);
  }else{
    
    //console.log('showAlert 지우기 settimeout', alertId);

    window.setTimeout(function () { 
      //console.log('showAlert setTimeout1 :', alertType);
      if( alertType != 'danger'){
        $("#" + alertId, alert_container).alert('close'); 
      }
      //$("#" + alertId, alert_container).alert('close'); // 테스트 끝나면 주석 풀기 quri
    }, 3000);
    
    window.setTimeout(function () { 
      //console.log('showAlert setTimeout2 :', alertType);
      if( alertType == 'danger'){
        $("#" + alertId, alert_container).alert('close'); 
      }
      //$("#" + alertId, alert_container).alert('close'); // 테스트 끝나면 주석 풀기 quri
    }, 15000);

  }

}






function json_clone( json ){
  cloneObj = Object.assign({}, json);
  return cloneObj;
}



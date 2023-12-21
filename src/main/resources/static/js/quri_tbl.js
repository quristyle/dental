function exsit_val (val){  if( val == null || val == undefined){ return false; } return true; }
function isempty (val){  if( val == '' || !exsit_val(val)){ return true; } return false; }
function isempty_trim (str){  val2 = str.trim(); if( val2 == '' || !exsit_val(val2)){ return true; } return false; }
function f_resize(){	
	$(window).trigger('resize');  
	setTimeout(() => {$(window).trigger('resize');  
		setTimeout(() => {$(window).trigger('resize');  
		//console.log('resize call.......'); 
		}, 1000);
	}, 500);
}

// Tabulator 그리드 생성 객체
$.fn.tblInit = function( colinfos, appFns ){
  //var tobj = $(this);
  var tobj = this;

  console.log('this :', this);
  console.log('tobj :', tobj);
  console.log('selector :', tobj.selector);

  
  tobj.seldic = [];
  tobj.seldic_orig = [];
  tobj.seldicFilter = [];
  useInfo = {}; // 내부 처리용 설정값.
  
  //'f:com_gb|t:구분,f:ccnt', 'rc:codelist'
  colsArr = colinfos.split(',');
  colarr = [];
  
  //colarr.push({ formatter:"rowSelection", width:50, titleFormatter:"rowSelection", hozAlign:"center", headerSort:false });
  
  //colarr.push({ title: "No", headerSort: false, width:50, hozAlign:"center", formatter:'rownum' });
  
  colsArr.forEach(function(el, idx){
    colinfo = {title:null, field:'', headerSort: false, width:100, hozAlign:'center'};
    //'f:com_gb|t:구분
    var els = el.split('|');
    
    els.forEach(function(el2, idx2){
      //'f:com_gb
      var el2s = el2.split(':');
      var t = el2s[0];
      var v = el2s[1];
      switch(t){
        case 'f' : colinfo.field =  v.toLowerCase();
             if( colinfo.title == null ){  colinfo.title = v;}
          break;
        case 't' : colinfo.title = v;
          break;
        case 'hide' : colinfo.visible = false;
        break;
        case 'h' : colinfo.headerSort = v;
          break;
        case 'w' : colinfo.width = v;
          break;
        case 's' : colinfo.headerSort = true;
          break;
        case 'a' : colinfo.hozAlign = ((v=='l')?'left':((v=='r')?'right':'center'));
          break;
        case 'e' : 
          if(v == 'checkbox'){
            colinfo.editor = true;
            colinfo.formatter = 'tickCross';
          // tickCross
          }else{
            colinfo.editor = v;
          }
          break;
        case 'ef' : colinfo.editor = eval(v);
          break;
        case 'epf' : colinfo.editorParams = { valuesLookup:"active"
                , valuesLookup:FnvaluesLookup
                };
        break;
        case 'epu' : // 리스트 사전값 불러 와서 표현, 리스트 목록 표현시 마다 불러와서 표현.
        case 'epu2' : // 리스트 사전값 불러 와서 표현, 리스트 목록 표현시 마다 불러와서 표현.
          colinfo.isEpu = true; // cell의 list형태로 제공되는 field
          tobj.seldic[colinfo.field] = {};
            var valarr = v.split('^');
            var pnm = valarr[0];
            var key = valarr[1].toLowerCase();
            var val = valarr[2].toLowerCase();
            var params = "p="+pnm+"&k="+key+"&v="+val;
          
          //console.log('valarr : ');
          //console.log(valarr);
  
          if( !isempty(valarr[3]) ){
            console.log('valarr[3] is exsit : '+valarr[3]);
            params += '&'+eval(valarr[3]+'()');
          }
          
        // 최초 데이터 코드 
        if( !isempty(valarr[4]) ){
          console.log('valarr[4] is exsit : '+valarr[4]);
          var ds = f_actionFn(parent, 'f_getComm_ds', valarr[4]);
  
          console.log( 'dddddddddddddddddddddddddddddddddddsssssssssssssssssssss', ds);
  
          ds.forEach(function(eel, idxx){
            tobj.seldic[colinfo.field][eel.cd_cd] = eel.cd_nm;
          });
  
        }
        else{
                          $.ajax({
                              url : '/fr4.jsp'
                            , type : 'post'
                            //, async: true
                          , context : {field:colinfo.field}
                            , data : params
                            , datatype : "json"
                            , timeout: 10000
                            , success : function(data, a, b){  
                                // if( !exsit_val(el2s[2])){
                                //   tobj.seldic[colinfo.field][''] = '';                                
                                // }
                              var dicname = this.field;
                              data.forEach(function(eel, idxx){
                                //tobj.seldic[colinfo.field][eel['value']] = eel['label'];
                                //tobj.seldic[field][eel['value']] = eel['label'];
                                tobj.seldic[dicname][eel['value']] = eel['label'];
                              });
                              }  
                            , error : function(request,status,error){
                                showAlert('danger',"code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error );
                              }
                            , fail : function() {
                                showAlert('danger',"상태를 확인필요.");
                            
                              }
                          });
        }
  
  
                          if( t == 'epu'){
  
                          colinfo.editorParams = { valuesLookup:"active"
                          , valuesLookup:function(cell, filterTerm){ 
                            
                            //console.log(tobj.seldic[cell._cell.column.field]);
  
    //console.log( cell );
    //console.log( filterTerm );
                            return tobj.seldic[cell._cell.column.field]; 
                          },
                           freetext:true,
                       // autocomplete:true,
                          //,filterRemote:true, //pass filter term to remote server in request instead of filtering
      //filterDelay:100, //delay in milliseconds after typing before filter begins
      //allowEmpty:true, //allow the user to leave the cell empty
      //listOnEmpty:true, //show all values in the list if the input is empty
      //mask:"AAA-999", //apply input mask to text entry
      //freetext:true, //allow the user to set the value of the cell to a free text entry
                          };
  
  
  
                          }
                          else if(t == 'epu2'){
  
                            colinfo.editorParams = function(selcell){ 
                              
                              console.log('selcell', selcell);
                              var rowdatas = selcell._cell.row.data;
  
                              var rowdatasString = Object.entries(rowdatas).map(e => e.join('=')).join('&');
  
                              return {  valuesURL:'/fr4.jsp?'+params+'&'+rowdatasString
                              //, values:[]
                              //, values:tobj.seldic[colinfo.field]
                            //, filterRemote:true
                            , valuesLookup:"active"
                            //, valuesLookupField:"value"
                          //	, valuesLookupField: colinfo.field
                        // , itemFormatter:function(label, value, item, element){
                         //return "<strong>" + label + " </strong><br/><div>" + item.NM + "</div>" ;
                      //		 value = item.C_KEY;
                      //	 return item.NM ;
                      //	     }
  
                         //, autocomplete:true
                          //	, clearable : true 
                            }
                            };
         
         
                          }
  
  
  
                          
    
                      colinfo.formatter = function( cell ) {
                            return tobj.seldic[cell._cell.column.field][cell._cell.value];
                      }
    
    
    
          break;
          case 'epu3' : // 리스트 사전값 불러 와서 표현, 리스트 목록 표현시 마다 불러와서 표현.... 기존값에 해당되는 데이터를 로드 한다.
            colinfo.isEpu = true; // cell의 list형태로 제공되는 field
            tobj.seldic[colinfo.field] = {};
            tobj.seldicFilter[colinfo.field] = [];
              var valarr = v.split('^');
              var pnm = valarr[0];
              var key = valarr[1].toLowerCase();
              var val = valarr[2].toLowerCase();
              var params = "p="+pnm+"&k="+key+"&v="+val;
            
            if( !isempty(valarr[3]) ){
              console.log('valarr[3] is exsit : '+valarr[3]);
              params += '&'+eval(valarr[3]+'()');
            }
            
          // 최초 데이터 코드 
          if( !isempty(valarr[4]) ){
            console.log('valarr[4] is exsit : '+valarr[4]);
            var ds = f_actionFn(parent, 'f_getComm_ds', valarr[4]);
            
            tobj.seldic_orig[colinfo.field] = ds;
            ds.forEach(function(eel, idxx){
              tobj.seldic[colinfo.field][eel.cd_cd] = eel.cd_nm;
            });	
          }
          else{
            $.ajax({
                url : '/fr4.jsp'
              , type : 'post'
              //, async: true
            , context : {field:colinfo.field}
              , data : params
              , datatype : "json"
              , timeout: 10000
              , success : function(data, a, b){  
                var dicname = this.field;
                tobj.seldic_orig[dicname] = data;
                data.forEach(function(eel, idxx){
                  tobj.seldic[dicname][eel['value']] = eel['label'];
                });
                }  
              , error : function(request,status,error){
                  showAlert('danger',"code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error );
                }
              , fail : function() {
                  showAlert('danger',"상태를 확인필요.");														
                }
            });
          }
  
          // 5가 존재 하면 이후 데이터의 필터로 활용 한다.
          if( !isempty(valarr[5]) ){
            console.log('valarr[5] is exsit : '+valarr[5]);					
            tobj.seldicFilter[colinfo.field].push(valarr[5]);
          }
          
          colinfo.editorParams = function(selcell){ 
            var c = selcell._cell.column;
            var rdata = selcell._cell.row.data;
            var result = {};
            var chkVal = tobj.seldicFilter[c.field];															
            $.each( chkVal, function( j, d){
              $.each( tobj.seldic_orig[c.field], function( j2, d2){
                if( rdata[d] == d2[d] ){
                  console.log('j2', j2, 'd2', d2);
                  result[d2.cd_cd] = d2.cd_nm;
                }
              });
            });	
            return {  values:result		}
          };
           
          colinfo.formatter = function( cell ) {
                return tobj.seldic[cell._cell.column.field][cell._cell.value];
          }
      
        break;
              
        case 'ep' : 
          v2 = [];
          v2arr = v.split('^');
          for( var i = 0; i < v2arr.length; i = i+2 ){
            // v2[v2arr[i]] = v2arr[i+1];
            v2.push({ label:v2arr[i+1], value:v2arr[i] });
          } 
          //console.log( v2 );
          colinfo.editorParams = {values:v2};
          // colinfo.editorParams = {values:[ {label:'red', value:"r"}
          //                                , {label:'green', value:"g"}]};
        break;
        case 'epcode' : 
          tobj.seldic[colinfo.field] = {};
          var ds = f_actionFn(parent, 'f_getComm_ds', v);
  
          console.log( 'ds-----------------------------------------------------------------------', ds );
  
          if( ds != null ){
            ds.forEach(function(eel, idxx){
              tobj.seldic[colinfo.field][eel['cd_cd']] = eel['cd_nm'];
            });
          }
          else{
            tobj.seldic[colinfo.field]['empty'] ='';
          }
  
          colinfo.editorParams = { valuesLookup:"active"
          , valuesLookup:function(cell, filterTerm){ 
            return tobj.seldic[cell._cell.column.field]; 
          },
           freetext:true,
          };
          
          colinfo.formatter = function( cell ) {
                return tobj.seldic[cell._cell.column.field][cell._cell.value];
          }
  
        break;
        case 'epcode_edit' : 
          colinfo.epcode_key = v;
          tobj.seldic[colinfo.field] = {};
          var ds = f_actionFn(parent, 'f_getComm_ds', v);
  
          console.log( 'ds-----------------------------------------------------------------------', ds );
  
          if( ds != null ){
            ds.forEach(function(eel, idxx){
              tobj.seldic[colinfo.field][eel['cd_cd']] = eel['cd_nm'];
            });
          }
          else{
            tobj.seldic[colinfo.field]['empty'] ='';
          }
  
          colinfo.editorParams = function(selcell){ 	
            console.log('editorParams selcell', selcell);
            var rowdatas = selcell._cell.row.data;
            var rowdatasString = Object.entries(rowdatas).map(e => e.join('=')).join('&'); 
            return { valuesLookup:function(cell, filterTerm){
                       return tobj.seldic[cell._cell.column.field]; 
                     },
                     freetext:true,
                     autocomplete:true,
            }
          };
  
  
  /*
          colinfo.editorParams = function(selcell){ 
                              
            console.log('selcell', selcell);
            var rowdatas = selcell._cell.row.data;
  
            var rowdatasString = Object.entries(rowdatas).map(e => e.join('=')).join('&');
  
            return {  valuesURL:'/fr4.jsp?'+params+'&'+rowdatasString
            //, values:[]
            //, values:tobj.seldic[colinfo.field]
          //, filterRemote:true
          , valuesLookup:"active"
          //, valuesLookupField:"value"
        //	, valuesLookupField: colinfo.field
      // , itemFormatter:function(label, value, item, element){
       //return "<strong>" + label + " </strong><br/><div>" + item.NM + "</div>" ;
    //		 value = item.C_KEY;
    //	 return item.NM ;
    //	     }
  
       //, autocomplete:true
        //	, clearable : true 
          }
          };
  
  
  
  */
  
  
  
  
  
          
          colinfo.formatter = function( cell ) {
            console.log('formatter this', this);
            
            console.log('formatter selcell', cell._cell.value, cell._cell);
            
            // 새 데이터가 포함 되어 있다면 main_ds 의 해당 코드를 새롭게 읽도록 한다.... 일딴 대기
            // 새 데이터면 표현 영역 정보에 추가 반영 하여 준다.
  
            // tobj.seldic[colinfo.field][eel['cd_cd']] = eel['cd_nm']; 
  
            //tobj.seldic[cell._cell.column.field][cell._cell.value] = cell._cell.value;
            var r_value = tobj.seldic[cell._cell.column.field][cell._cell.value];
            if( isempty( r_value ) ){
              tobj.seldic[cell._cell.column.field][cell._cell.value] = cell._cell.value;
              r_value = cell._cell.value;
            }
                return r_value;
          }
  
        break;
        case 'fmt' : colinfo.formatter = eval(v);
        break;
        case 'fm' : 
          if( v == 'money'){
            colinfo.formatter = v;
            //colinfo.bottomCalc = adultCalc0;
            colinfo.hozAlign = 'right';
            colinfo.formatterParams={ decimal:"."  // 소수점 표현 
                                    , precision:0  // 소수점 표현
                                    } ;
          }
          else if(v=='checkbox'){
            colinfo.formatter = 'tickCross';
            //tickCross
          }
          else{
            colinfo.formatter = v;
          }
        break;
          //formatter
      }
    });
    colarr.push(colinfo);
  
  });
  
  
  var grpOtpStr = '';
  
  colarr.forEach(function(el, idx){
    if( !isempty(el.title) ){
      if( el.title == 'No'){
        grpOtpStr += '<option value="">없슴</option>' ;
      }
      else{
        grpOtpStr += '<option value="'+el.field+'">'+el.title+'</option>' ;
      }
    }
  });
  
  //colarr.push({ title: "", headerSort: false,  });// 뒤를 채우기 위함.
  
  var TabuInfo = { layout:'fitColumns'
  //, pagination: false // 'local'  //remote
                  //, pagination: 'local'  //remote
                  //, paginationSize:500
                  //, paginationAddRow:"table" //add rows relative to the table
                  , selectable:true    // 클릭시 row 선택 자동
                  , selectableRangeMode: 'click' // 하나의 row만 selected 된다.. 멀티는 shift, ctrl 조합.
                  //, selectablePersistence:false // disable rolling selection  ?????????????????
                  //groupBy:"r_nm",
                  //groupValues:[],
                  , height: 100
                  , isBtns : {search:false,add:false,copy:false,delete:false,save:false,export:false} // passing 영역에 버턴은 기본으로 보여준다. 
                  //, paginationElement: '#aadfdsf'
                  //, placeholder:"조회된 데이터가 없습니다."
                  //, cellHozAlign: 'center'
                 };
  
  
                //  TabuInfo.renderComplete = function(){
                
                  
                // $('.tabulator-paginator', tmpTB).empty();
                // $('.tabulator-paginator', tmpTB).append('<button class="btn btn-sm">add</button><button class="btn btn-sm">Delete</button>')
                
                
                // };
                
                
                
  
                 /*
                 pagination:"local",
      paginationSize:6,
      paginationSizeSelector:[3, 6, 8, 10],
      movableColumns:true,
      paginationCounter:"rows",
                 */
  
  
  // appFns
  if( appFns == null ){
    appFns = '';
  }
  var apps = appFns.split('|');
  

  //debugger;


  apps.forEach(function(el, idx){
      //'f:com_gb
      var els = el.split(':');
      var t = els[0];
      var v = els[1];
      switch(t){
        case 'rc' : //TabuInfo.rowClick = eval(v); // 로우 클릭 이벤트
          colarr.forEach(function(a, b){
            //a.rowClick = eval(v);
            a.cellClick = eval(v);
          });
          break;
        case 'btns' : // search:false,add:false,copy:false,delete:false,save:false,export:false
          if( isempty(v) ){}else{
          if(v.indexOf('s') >= 0){ TabuInfo.isBtns.search = true;	}
          if(v.indexOf('a') >= 0){ TabuInfo.isBtns.add = true;	}
          if(v.indexOf('c') >= 0){ TabuInfo.isBtns.copy = true;	}
          if(v.indexOf('v') >= 0){ TabuInfo.isBtns.save = true;	}
          if(v.indexOf('d') >= 0){ TabuInfo.isBtns.delete = true;	}
          if(v.indexOf('e') >= 0){ TabuInfo.isBtns.export = true;	}
          }
          break;
        case 'rdc' : //TabuInfo.rowDblClick = eval(v);// 로우 더블클릭 이벤트
          colarr.forEach(function(a, b){
            a.cellDblClick = eval(v);
          });
          break;
        case 'n' : 
        if( v == 'x' ){ colarr.shift();}
        break;
        case 'h' : TabuInfo.height = v; // 그리드 높이 강제..
          break;
        case 'no' : 
          
  
  colarr.unshift({ title: "No", headerSort: false, width:50, hozAlign:"center", formatter:'rownum' });
  
          break;
        case 'chk' : 
            
            
  colarr.unshift({ formatter:"rowSelection", width:50, titleFormatter:"rowSelection", hozAlign:"center", headerSort:false });
  
  
          break;
        case 'edt_xxxxxxxxxx' : // 셀 데이터가 수정될때 호출 되는 이벤트 // 이딴 공통처리로.. 이놈 사용 금지..
          colarr.forEach(function(a, b){
  
            //cell_edited(a, b, v);
            a.cellEdited = function(cell){
              cell_edited(cell, v);
            }
            //a.callback_fn = v;
          });
          //TabuInfo.cellEdited = eval(v);
          break;
        case 'gr' : TabuInfo.groupBy = v;// 데이터를 그룹으로 묶어서 표현
        useInfo.swichGroupby = true;
          break;
        case 'k' : TabuInfo.index = v;// 이거 모지???
          break;
        case 'proc' : 
          varr = v.split('^');
          TabuInfo.procName = varr[0];// 데이터 호출에 사용할 프로시저명
          if( varr.length > 1){
            var data = new Object();
            data[varr[1].split('=')[0]] = varr[1].split('=')[1];
            TabuInfo.defaultPram = data;//JSON.stringify(data);
          }
        break;
        case 'proc_save' : TabuInfo.procSaveName = v;// 데이터 호출에 사용할 프로시저명
        break;
        case 'key' : 
        //debugger;
        TabuInfo.rowkey = v;// 저장후 반환값 반영할 곳.
        break;
        //rowkey
        case 'sform' : TabuInfo.formid = v;// 데이터 호출에 사용할 파라미터 form
        case 'saveform' : TabuInfo.saveformid = v;// 데이터 호출에 사용할 파라미터 form
        break;
      }
    });


    console.log("colarr foreach start :", colarr);
  
    colarr.forEach(function(a, b){
  
      //cell_edited(a, b, v);
      
      a.cellEdited = function(cell){
  
        //console.log('----------------cell------------------');
        //console.log(cell);
        
        var c = cell._cell.row.data;
        switch(c.tbl_cb){
          case 'I' : break;
          case 'U' : break;
          case 'D' : break;
          default : 
            c.tbl_cb = 'U';
            tmpTB.redraw(true);
        }
  
        if(a.isEpu) { // 여기서 epu 이면..cell의 list형태로 제공되는 field
          //tmpTB.myObj.seldic[a.field][cell._cell.value] = cell._cell.value;
          tmpTB.redraw(true);
        }
  
        //if( callback_fn != null ){
          //eval(callback_fn);
        //}
  
        if($.isFunction( window.f_grdedited )){
          f_grdedited(cell);
        }
        
      }
      
      //a.callback_fn = v;
    });
  
    colarr.unshift({ title: "tbl_uuid", headerSort: false, width:50, hozAlign:"center", field:'tbl_uuid', visible:false, });
    colarr.unshift({ title: "tbl_cb", headerSort: false, width:50, hozAlign:"center", field:'tbl_cb', visible:false, });
  
    TabuInfo.columns=colarr;
    // TabuInfo. ajaxSorting= !0
    // TabuInfo. rowClick= null
    // TabuInfo.rowDblClick= null
    // TabuInfo.cellVertAlign: 'middle'
  
    
  TabuInfo.rowSelectionChanged=function(data, rows){
    //rows - array of row components for the selected rows in order of selection
      //data - array of data objects for the selected rows in order of selection
      //여기에 이벤트 정의
      console.log('rowSelectionChanged');
  };
  
  
  //// search:false,add:false,copy:false,delete:false,save:false,export:false
  var footer_str = '';
  footer_str += '<div class="btn-group grdfootbtn">';
  if(TabuInfo.isBtns.search) {	footer_str += '<button class="btn btn-primary btn-srch" t="srch" title="조회" >조회</button>';};
  if(TabuInfo.isBtns.add) {	footer_str += '<button class="btn btn-primary btn-add" t="add" title="추가" >추가</button>';};
  if(TabuInfo.isBtns.copy) {	footer_str += '<button class="btn btn-primary btn-copy" t="copy" title="복사" >복사</button>';};
  if(TabuInfo.isBtns.save) {	footer_str += '<button class="btn btn-primary btn-save" t="save" title="저장" >저장</button>';};
  if(TabuInfo.isBtns.delete) {	footer_str += '<button class="btn btn-primary btn-delete" t="delete" title="삭제" >삭제</button>';};
  if(TabuInfo.isBtns.export) {	footer_str += '<button class="btn btn-primary btn-export" t="down" title="엑셀" >엑셀</button>';};
  footer_str += '</div>';
  TabuInfo.footerElement = footer_str;
  
  //console.log("tobj :", tobj);
  //console.log("tobj selector:", tobj.selector);
  //console.log("TabuInfo :", TabuInfo);
  
  //var tmpTB = new Tabulator (tobj.selector, TabuInfo);
  var tmpTB = new Tabulator (tobj.get(0), TabuInfo);
  tmpTB.selector = tobj.get(0);
  
  //console.log("tmpTB tobj.get(0) :", tobj.get(0));
  //console.log("tmpTB ----------------------------- :", tmpTB);

  tmpTB.myObj = tobj;
  tmpTB.opt = TabuInfo;
  tmpTB.swichGroupBy =  function (){
    if( useInfo.swichGroupby ){
      this.setGroupBy(null);
    }
    else{
      this.setGroupBy(this.opt.groupBy);
    }
    useInfo.swichGroupby = !useInfo.swichGroupby;
  }
  
  tmpTB.grpOtpStr = grpOtpStr;
  
  tmpTB.initOption =  function (){
    if( exsit_val(this.opt.groupBy) ){
      useInfo.swichGroupby = true;
      this.setGroupBy(this.opt.groupBy);
    }
  }
  
  
  tmpTB.o_setData = tmpTB.setData;
  
  tmpTB.setData = function(data){
    setdata_result = {isFristSelectRow:false};
    setdata_result.setdt = tmpTB.o_setData(data);
    if( data.length > 0){
      //console.log(tmpTB.options.index);
      //console.log(isempty(tmpTB.options.index));
      //console.log(isempty(data[0][tmpTB.options.index]));
      if( !isempty(data[0][tmpTB.options.index]) ){
        tmpTB.selectRow(data[0][tmpTB.options.index]);  
      } 
      setdata_result.isFristSelectRow = true;
    }
    return setdata_result;
  }
  
  
  tmpTB.emptyData = function(){	
    tmpTB.owner_val = null;	
    if( tmpTB.initialized ){
      tmpTB.clearData();
    }
    else{
      setTimeout(function(){
        tmpTB.clearData();
      },100);
    }
  }
  
  
  tmpTB.loadDataLoadComplateCheck = function(callback_fn){
    if(tmpTB.initialized){
      $('.lds-dual-ring', tmpTB.selector).css('display', 'block');
      clearInterval(tmpTB.loadDataLoadComplate);
      setTimeout(function(){
      tmpTB.dataLoad(callback_fn);
      },1);
    }
  }
  
  
  //console.log("tmpTB.dataLoad : set");
  
  tmpTB.dataLoad = function dataLoad( callback_fn ){	
    //console.log('call dataLoad');
    //console.log('tmpTB.initialized : '+tmpTB.initialized);
    $('.lds-dual-ring', tmpTB.selector).css('display', 'block');
  
    if(tmpTB.initialized){
    }
    else{
      tmpTB.loadDataLoadComplate = setInterval(function(){
        //console.log('loadDataLoadComplate'+tmpTB.selector+'___________'+tmpTB.initialized);
        tmpTB.loadDataLoadComplateCheck(callback_fn);
      }, 1);    
      return;
    }
  
  
        $('.lds-dual-ring', tmpTB.selector).css('display', 'block');
        //console.log('call dataLoad setTimeout');
        if( tmpTB.initialized ){
          tmpTB.clearData();
        }
        var appendParams = null;
        if( !isempty(TabuInfo.defaultPram) ){
          appendParams = [TabuInfo.defaultPram];
        }
        if( !isempty(tmpTB.owner_val) ){
          appendParams = [tmpTB.owner_val];
        }
        
    $('.lds-dual-ring', tmpTB.selector).css('display', 'block');
        excute(tmpTB.opt.procName, tmpTB.opt.formid, appendParams, function( jdata ){
          //console.log('dataload searchCallback '+tmpTB.initialized);
          if( tmpTB.initialized ){
            tmpTB.setData(jdata.data); 
  
            if( callback_fn != null ){
              callback_fn();
            }
            f_resize();
            
            $('.lds-dual-ring', tmpTB.selector).css('display', 'none');
          }
          else{
            //console.log('dataload searchCallback init fail');
            setTimeout(function(){
              //console.log('dataload searchCallback settime out : '+tmpTB.initialized);
              tmpTB.setData(jdata.data); 
              if( callback_fn != null ){
                callback_fn();
              }
              f_resize();
              $('.lds-dual-ring', tmpTB.selector).css('display', 'none');
            },100);
          }
      }); 
  
  }
  
  
  tmpTB.save = function( callback_fn ){	
    var data = tmpTB.searchData("tbl_cb", "keywords", "I U D", {matchAll:true}); // 수정대상 데이터 

    if( data.length <= 0 ){
      showAlert( 'warning', '저장 항목이 존재하지 않습니다', false);     
      return; 
    }

    excute(tmpTB.opt.procSaveName, tmpTB.opt.saveformid, data, function( jdata ){ 
  
      if(jdata.code >= 0 ){
        //debugger;
        if(!isempty(tmpTB.opt.rowkey) ){
  
          var jrd = jdata.piinfo.tbl_list; // 저장후 mapkey      
          var allRows = tmpTB.searchRows("tbl_cb", "keywords", "I", {matchAll:true}) // 해당 그리드 데이터
  
          $.each(jrd, function(j, d ){	// 데이터 loop
          
            $.each(allRows, function(i, __v ){		// gridrow loop
              var v = __v._row.data; // row data
              if( v.tbl_uuid == d.arguments.tbl_uuid){ // 일치하는 row 발견    
                console.log('일치 발견', d.arguments.tbl_uuid);        
                console.log('key 반영', d.returnArguments.tbl_uuid);        
                v[tmpTB.opt.rowkey] = d.returnArguments.tbl_uuid; // row의 key에 데이터 반영.
                //return false; // grid break;
              }
            });
  
          });
  
        }			
        showAlert( 'success', 'Saved', false);
        
        var delRows = tmpTB.searchRows("tbl_cb", "keywords", "D", {matchAll:true}) // 해당 그리드 데이터
        tmpTB.deleteRow(delRows);
      }
      //
    //tmpTB.deleteRow(selectedRows);
  
      tmpTB.clearStatus();
      if( callback_fn ){ callback_fn(jdata); }
    }); 
  }
  
  
  tmpTB.newRow = function( ){	
    var cell = {};
    if($.isFunction( window.f_add )){
      f_add(tmpTB, cell);
    }
    cell.tbl_uuid = generateUUID();
    cell.tbl_cb = 'I';
    tmpTB.addData([cell], true)
          .then(function(rows){
            if($.isFunction( window.f_add_call )){
              f_add_call(tmpTB, cell, rows);
            }
          });
  }
  
  tmpTB.selectedRowDel = function( callback_fn ){	
    var selectedData = tmpTB.getSelectedData();
    var selectedRows = tmpTB.getSelectedRows();
    $.each(selectedRows, function(idx, val ){
      if( val._row.data.tbl_cb == 'I'){
        val._row.delete();
      }
      else{
        val._row.data.tbl_cb = 'D';
      }
      //tmpTB.updateRow(val._row.position, val._row);
      //val.update({CRUD:'D'});
    });
    //tmpTB.updateRow([{CRUD:'D'}]);
    tmpTB.redraw(true); 
    tmpTB.save();
    
    if( callback_fn ){ callback_fn(); }
  }
  
  
  tmpTB.clearStatus = function( ){	
    var allRows = tmpTB.getRows();
    console.log(allRows);
    //tmpTB.deleteRow(selectedRows);
    $.each(allRows, function(idx, val ){		
      val._row.data.tbl_cb = '';
      // 추가의 경우 key 가 되는 항목을 처리 해 주어야 함.. 회사코드와 같이..
    });
    tmpTB.redraw(true);
  }
  
  
  //debugger;
  
  tmpTB.loadCompfn = function(){
  
  //$(document).on('click', tmpTB.selector+' .grdfootbtn button', function(){
  $(tmpTB.selector).on('click', ' .grdfootbtn button', function(){
    console.log('grd footer button');
    $('.alert_container').empty();
    var t = $(this).attr('t');
    switch(t){
      case 'save' : tmpTB.save(); break;
      case 'add' : tmpTB.newRow(); break;
      case 'delete' : tmpTB.selectedRowDel(); break;
      case 'down' : tmpTB.download("xlsx", "data.xlsx", {sheetName:"MyData"}); break;
      case 'srch' : tmpTB.dataLoad(); break;
      case 'copy' : tmpTB.copy(); break;
    }
  });
  
    //  table.download("xlsx", "data.xlsx", {sheetName:"My Data"});
  
    //tmpTB.setData([]);
  
    // 로딩바 추가
    $('.tabulator-tableholder', tmpTB.selector).append('<div class="lds-dual-ring"></div>');
  }
  
  
  //tmpTB.append('<div class="lds-dual-ring"></div>');
  
  
  //tmpTB.initialized
  
  tmpTB.loadComplate = setInterval(function(){
    //console.log('loadComplate'+tmpTB.selector+'___________'+tmpTB.initialized);
    setTimeout(() => {
      tmpTB.loadComplateCheck();		
    }, 100);
  }, 1000);
  
  tmpTB.loadComplateCheck = function(){
    if(tmpTB.initialized){
      clearInterval(tmpTB.loadComplate);
      tmpTB.loadCompfn();
    }
  }
  
  return tmpTB;
  
  } // tblInit end..











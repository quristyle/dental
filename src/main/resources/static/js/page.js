






  // 공통버튼 이벤트
	if( !$.isFunction( window.f_search )){    $('.page_btn_div > .btn-srch').css('display', 'none').remove();	}
	if( !$.isFunction( window.f_add )){  $('.page_btn_div > .btn-add').css('display', 'none').remove();	}
	if( !$.isFunction( window.f_delete )){  $('.page_btn_div > .btn-delete').css('display', 'none').remove();	}
	if( !$.isFunction( window.f_copy )){  $('.page_btn_div > .btn-copy').css('display', 'none').remove();	}
	if( !$.isFunction( window.f_export )){  $('.page_btn_div > .btn-export').css('display', 'none').remove();	}
	if( !$.isFunction( window.f_save )){  $('.page_btn_div > .btn-save').css('display', 'none').remove();	}


$('.page_btn_div').css('display', 'inline-flex');


$(document).on('click', '.page_btn_div > button', function (){	  
  $('.alert_container').empty();
});	

// button action 이벤트 등록
$(document).on('click', '.page_btn_div > .btn-srch', function (){		
	if($.isFunction( window.f_per_search ) && $.isFunction( window.f_search ) ){	
    if( f_per_search() ){
      f_search();	
    }
  }
  else if( $.isFunction( window.f_search ) ){
    f_search();	
  }
  else{
    alert('not found actions');
  }
});

$(document).on('click', '.page_btn_div > .btn-save', function(){		
	if($.isFunction( window.f_per_save ) && $.isFunction( window.f_save ) ){	
    if( f_per_save() ){
      f_save();	
    }
  }
  else if( $.isFunction( window.f_save ) ){
    f_save();	
  }
  else{
    alert('not found actions');
  }
});

$(document).on('click', '.page_btn_div > .btn-add', function(){		
	if($.isFunction( window.f_per_add ) && $.isFunction( window.f_add ) ){	
    if( f_per_add() ){
      f_add();	
    }
  }
  else if( $.isFunction( window.f_add ) ){
    f_add();	
  }
  else{
    alert('not found actions');
  }
});

$(document).on('click', '.page_btn_div > .btn-delete', function(){		
	if($.isFunction( window.f_per_delete ) && $.isFunction( window.f_delete ) ){	
    if( f_per_delete() ){
      f_delete();	
    }
  }
  else if( $.isFunction( window.f_delete ) ){
    f_delete();	
  }
  else{
    alert('not found actions');
  }
});

$(document).on('click', '.page_btn_div > .btn-export', function(){		
	if($.isFunction( window.f_per_export ) && $.isFunction( window.f_export ) ){	
    if( f_per_export() ){
      f_export();	
    }
  }
  else if( $.isFunction( window.f_export ) ){
    f_export();	
  }
  else{
    alert('not found actions');
  }
});

<%@ page language="java" contentType="text/html;charset=GBK"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jstl/fmt_rt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link type="text/css" rel="stylesheet" href="css/login_new.css" />
<script type="text/javascript" src="jquery/jquery-1.7.1.min.js"></script>
<script type=text/javascript>
	$(document).ready(function() {
		$.ajax({
			url : "getCookieUser.do",
			type : "post",
			success : function(txt) {
				if(txt=='success'){
					location.href='adminLogin.do?type=2';
				}else if(txt=='fail'){
				}
			}
		});
	});
function change(obj){
	var time = new Date().getTime();
	obj.src="chineseVal.jsp?i="+time;
}
</script>

<title>��¼_�ۺ�ƽ̨</title>
</head>

<body>
<div class="cont-bg">
<div class="h188"></div>
<div id="container">
	<div class="h90"></div>
    <form name="myForm" action="login.do" method="post">
      <div class="border-radius"><label class="l-user">OA�˺�:</label><input type="text" name="admin_id" id="admin_id"/></div>
     <!-- 
      <div class="login-txt"><p><a href="findPwd.do">����������?</a></p></div>
	   -->
	  <div class="border-radius">
	    <label class="l-psd">��&nbsp;&nbsp;��:</label><input type="password" name="admin_pwd" id="admin_pwd"  /></div>
	  <div class="border-radius border-code"><label>��֤��:</label><input type="text" class="l-ipt-code" name="check_code" id="check_code"/></div>
      <div class="code"><img onclick="change(this);" title="���ˢ����֤�룡" src="chineseVal.jsp"/></div>
      <div class="clear"></div>
      <div class="login-cb" title="Ϊ����Ϣ��ȫ,�벻Ҫ�����ɻ��߹��õ�����ʹ�ô˹���"><input name="cookieLogin" type="checkbox" value="cookieLogin" class="input-check" />30�������¼</div>
    	<div class="l-btn"><input type="submit" class="ipt-submit" value=""/>
        	<input type="reset" class="ipt-reset" value=""/></div>
    </form>
</div>
<div class="clear"></div>
</div>
</body>
</html>


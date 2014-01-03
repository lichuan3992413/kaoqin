<%@ page language="java" contentType="text/html;charset=GBK"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jstl/fmt_rt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>ҵ���û�ת��</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<link type="text/css" rel="stylesheet" href="css/global.css" />
		<link type="text/css" rel="stylesheet" href="css/content.css" />
		<link rel="stylesheet" type="text/css"
			href="css/default/om-default.css" />
		<link rel="stylesheet" href="css/validationEngine.jquery.css"
			type="text/css" media="screen" title="no title" charset="gbk" />
		<script type="text/javascript" src="js/jquery/jquery-1.7.1.min.js"></script>
		<script type="text/javascript" src="js/js/operamasks-ui.min.js"></script>
		<script src="js/jquery/jquery.validationEngine-cn.js"
			type="text/javascript"></script>
		<script src="js/jquery/jquery.validationEngine.js"
			type="text/javascript"></script>
		<script type="text/javascript" src="js/time/WdatePicker.js"></script>
		<script type="text/javascript">
		$(document).ready(function() {
			$("#formID").validationEngine();
});
		</script>


		<style>
/*�����굥
*/
.form-div {
	margin: 10px;
	width: 960px;
}

.form-div h3 {
	text-align: center;
	font-size: 14px;
	margin: 10px 0;
	color: #0066cc;
}

.form-table {
	color: #4D4D4D;
	border: 1px solid #EFEFEF;
	border-bottom: none;
	border-right: none;
}

.form-table td {
	border: 1px solid #EFEFEF;
	border-top: none;
	border-left: none;
	padding: 8px 0;
}

.form-table td.form-tbl-title {
	background: #FAFAFA;
	width: 65px;
	padding-left: 15px;
	color: #0066cc;
}

.form-btn {
	padding: 10px 10px 10px 95px;
	border-bottom: 1px solid #EFEFEF;
}

.user_ip {
	
}

.user_ip span {
	display: block;
	float: left;
	padding: 4px;
	margin: 4px;
	background: #E1F2FC;
	color: #0066cc;
	position: relative;
}

.user_ip span a {
	display: block;
	position: absolute;
	background: url(images/layout/tabs_close.gif) no-repeat center;
	width: 10px;
	height: 10px;
	top: -5px;
	right: -5px;
}
</style>
	</head>

	<body>
		<div id="container">
			<div class="add_top">
				<a href="#">
					&gt;&gt;����</a>
			</div>
			<!--add_form start-->
			<form action="transitionSmsUser_submit.do" method="post" id="formID">
				<div class="form-div">
					<h3>
						Smsҵ���û�ת��
					</h3>
					<table width="100%" border="0" cellpadding="0" cellspacing="0"
						class="form-table">
						<tr>
							<td width="150" class="form-tbl-title">
								<label style="float: right;">
									�ͻ����룺
								</label>
							</td>
							<td width="307">
								&nbsp;${userInfo.customer_code }
								<input type="hidden" name="customer_code" id="customer_code"
									value="${userInfo.customer_code }" />
							</td>
							<td width="257" class="form-tbl-title">
								<label style="float: right;">
									������ID��
								</label>
							</td>
							<td width="294">
								&nbsp;${userInfo.server_id }
								<input type="hidden" name="server_id" id="server_id"
									value="${userInfo.server_id }" />
							</td>
						</tr>
						<tr>
							<td width="101" class="form-tbl-title">
								<label style="float: right;">
									�û�ID��
								</label>
							</td>
							<td width="307">
								&nbsp;${userInfo.user_id }
								<input id="user_id" type="hidden" name="user_id" value="${userInfo.user_id }" />
							</td>
							<td width="101" class="form-tbl-title">
								<label style="float: right;">
									�û����ƣ�
								</label>
							</td>
							<td width="307">
								&nbsp;${userInfo.user_name }
								
							</td>
						</tr>
						<tr>
							<td width="257" class="form-tbl-title">
								<label style="float: right;">
									�г���Ա��
								</label>
							</td>
							<td width="294">
								&nbsp;<c:forEach items="${sessionScope.adminList}"
									var="each">
									<c:if test="${userInfo.market_staff eq each.admin_id}">
									${each.admin_name }
								</c:if>
								</c:forEach>
							</td>
							<td width="101" class="form-tbl-title">
								<label style="float: right;">
									�ͷ���Ա��
								</label>
							</td>
							<td width="307">
								&nbsp; <c:forEach items="${sessionScope.adminList}"
									var="each">
									<c:if test="${userInfo.service_staff eq each.admin_id}">
									${each.admin_name }
								</c:if>
								</c:forEach>
								
							</td>
							
						</tr>

						<tr>
						
							<td class="form-tbl-title">
								<label style="float: right;">
									�Ʒѷ�ʽ��
								</label>
							</td>
							<td>
								&nbsp;
								<input type="radio" name="oem_price" value="1" />
								�����Ʒ�
								<input type="radio" name="oem_price" value="-1"
									checked="checked" />
								���Ʒ�
							</td>
							<td class="form-tbl-title">
								<label style="float: right;">
									�Ʒ����ͣ�
								</label>
							</td>
							<td>
								&nbsp;
								<input type="radio" name="charge_type" value="0" />
								�ɹ��Ʒ�
								<input type="radio" name="charge_type" value="1"
									checked="checked" />
								�ύ�Ʒ�
							</td>
						</tr>
					</table>

					<div class="form-btn">
						<input name="" type="submit" value="�ύ" />
						<input name="" type="reset" value="����" onclick="" />
					</div>
				</div>
			</form>
			<!--add_form end -->
		</div>
	</body>
</html>

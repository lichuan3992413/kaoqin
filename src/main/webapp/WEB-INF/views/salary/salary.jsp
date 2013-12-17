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
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ҵ���û��б�</title>
		<link type="text/css" rel="stylesheet"
			href="<%=path%>/css/global.css" />
		<link type="text/css" rel="stylesheet"
			href="<%=path%>/css/content.css" />
		<script type="text/javascript" src="js/jquery/jquery-1.7.1.min.js"></script>
		<script type="text/javascript" src="js/util/tableStyle.js"></script>
		<script type="text/javascript">
</script>

	</head>
	<body>
		<div id="container">
			<!--�������� start-->
			<div id="toolbar">

				<!--��ť-->
				
				<!--��ť-->
			</div>
			<!--�������� end-->
			<!--���� start-->
			<div class="datalist">
				<table cellpadding="0" cellspacing="0" class="tablestyle"
					id="tableStyle">
					<tbody>
						<tr>
							<th width="50" nowrap="nowrap">
								���
							</th>
							<th nowrap="nowrap">
								��Ա����
							</th>
							<th nowrap="nowrap">
								������
							</th>
							<th nowrap="nowrap">
								ǩ��ʱ��
							</th>
							<th nowrap="nowrap">
								ǩ��ʱ��
							</th>
							<th nowrap="nowrap">
								����
							</th>
							<th nowrap="nowrap">
								��ע
							</th>
							
							<th nowrap="nowrap">
								����
							</th>
						</tr>
					</tbody>
					<tbody>
						<c:forEach var="salary" items="${list}" varStatus="status">
							<tr>
								<td>
									${status.index+1}&nbsp;										
								</td>
								<td>
									${salary.user_name}
								</td>
								<td>
									${salary.every_date}

								</td>
								<td>
									${salary.checkin_time}
								</td>
								<td>
									${salary.checkout_time}
								</td>
								<td>
									${salary.type}
								</td>
								<td>
									${salary.comment}
								</td>
								<td>
									<a href="modCustomerInfo.do?sn=${customerinfo.sn}">[�޸�]</a>
								</td>

							</tr>
						</c:forEach>

					</tbody>
				</table>
				<!--���� end-->

			</div>

		</div>
	</body>
</html>

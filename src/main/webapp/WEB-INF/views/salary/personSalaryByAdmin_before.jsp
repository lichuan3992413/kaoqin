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

<link rel='stylesheet' href='cupertino/theme.css' />
<link rel="stylesheet" type="text/css" href="css/default/om-default.css" />
<link href='fullcalendar/fullcalendar.css' rel='stylesheet' />
<link href='fullcalendar/fullcalendar.print.css' rel='stylesheet' media='print' />

<script src='jquery/jquery-1.9.1.min.js'></script>
<script src='jquery/jquery-ui-1.10.2.custom.min.js'></script>
<script src='fullcalendar/fullcalendar.min.js'></script>
<script type="text/javascript" src="js/time/WdatePicker.js" defer="defer"></script>	
<script type="text/javascript" src="js/js/operamasks-ui.min.js"></script>
<script>

	$(document).ready(function() {
		
		/*var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();*/
		
		var calendar = $('#calendar').fullCalendar({

			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
			// monthNames: ["һ��", "����", "����", "����", "����", "����", "����", "����", "����", "ʮ��", "ʮһ��", "ʮ����"],
             monthNames: ["1��", "2��", "3��", "4��", "5��", "6��", "7��", "8��", "9��", "10��", "11��", "12��"],
              dayNames: ["����", "��һ", "�ܶ�", "����", "����", "����", "����"],
              dayNamesShort: ["����", "��һ", "�ܶ�", "����", "����", "����", "����"],
              //today: ["����"],
              firstDay: 1,
              buttonText: {
                  today: '����',
                  month: '��',
                  week: '��',
                  day: '��',
                  prev: '<',
                  next: '>'
             },
			selectable: true,
			selectHelper: true,
			select: function(start, end, allDay) {
			
				var title = prompt('���ʵǼ�:');
				if (title) {
				
				var params = {title: title,
                  start: start,
                  end: end,
                  allDay: allDay,
				  oa:${oa}
              	};
              	alert('aaa');
              	
				$.ajax({
				
                  url:"/salary/getPersonSalaryByAdmin.do",
                  type:"post",
                  data:params,
                    dataType: 'json',
                    success: function(res){
                        alert(res);
                    },
                    err:function(res){
                        $("#err1").html("<strong>��������!</strong>");
                        $("#err1").show();
                        setTimeout(function(){$("#err1").hide();},3000);
                    }
              });//insert
              
              
					calendar.fullCalendar('renderEvent',
						{
							title: title,
							start: start,
							end: end,
							allDay: allDay
						},
						true // make the event "stick"
					);
				}
				calendar.fullCalendar('unselect');
			},
			editable: true,
						events: [
				
				<c:forEach var="each" items="${calendars}" varStatus="status">
					{
						title: '${each.type_desc}',
						start: '${each.start_date}',
						end: '${each.end_date}'
					},
   	 			</c:forEach>
   	 			
				<c:forEach var="each" items="${list}" varStatus="status">
					{
						title: '${each.comment}',
						start: '${each.every_date}'
					},
   	 			</c:forEach>
   	 			
				<c:forEach var="each" items="${list}" varStatus="status">
					{
						title: '${each.show_checkin_time} - ${each.show_checkout_time}',
						start: '${each.every_date}'
					},
					
   	 			</c:forEach>
   	 			
				<c:forEach var="each" items="${leaves}" varStatus="status">
					{
						title: 'δ�򿨣�������',
						start: '${each.every_date}'
					},
   	 			</c:forEach>

				{
					//title: '',
					//start: new Date(y, m, 30),
					//end: new Date(y, m, 31),
					//url: 'http://google.com/'
				}
			]
		});
		$('#calendar').fullCalendar( 'gotoDate',${year},${month});
	});

</script>
<style>
	
	body {
		margin-top: 40px;
		text-align: center;
		font-size: 13px;
		font-family: "Lucida Grande",Helvetica,Arial,Verdana,sans-serif;
		}
	#Container{ width:1100px; margin:0 auto; text-align:left; overflow:hidden;}
	
	#calendar {
		width: 900px;
		margin: 0 auto;
		float:left;
		}
	.fc-sat .fc-day-number, .fc-sun .fc-day-number{ color:#F60;}
	
	.collect{ width:auto; margin:40px 0 0 900px; padding-bottom:10px;
		background:#F2F2F2; font: 12px/1.7 "Microsoft YaHei",Arial,sans-serif;}
	.collect h2{ margin:0; padding-left:20px; border:1px solid #A8CEE1; border-left:none; border-right:none;
		background:#C2EBFF; font: normal 14px/30px "΢���ź�";}
	.collect dl{ overflow:hidden; color:#444; margin:10px 0;}
	.collect dt, .collect dd{ line-height:26px;}
	.collect dt{ float:left; width:90px; padding:0 10px 0 6px; text-align:right;}
	.collect dd{ width:auto;  margin-left:106px; font-size:14px; color: #008caf;}

</style>
</head>
<body>

			<!--�������� start-->
			<div id="toolbar">
				<form method="post" onsubmit="return submitButton();"
					id="filterForm" name="filterForm">
					<span> <label for="user_name">
							Ա��������
						</label> <input name="user_name" id="user_name" class="inpstyle"
							value="${user_name}" type="text" value=""
							onblur="change_value(this);" />
					</span>
					<span><label for="every_month">
						�·ݣ�
						</label>
						<input  type="text" name="month" id="every_month"  value="${month }" onfocus="WdatePicker({skin:'whyGreen',dateFmt:'yyyy-MM'})" class="inpstyle validate[required] text-input field"/>
					</span>
					<span>
						<input class="btnstyle" type="submit" value="�� ѯ" />
					</span>
					<span>
					<a href="customerInfo_export.do?type=${type}&customer_id=${customer_id}&customer_name=${customer_name}&customer_service_name=${customer_service_name}&customer_market_name=${customer_market_name}"
						class="link_red">����Excel����</a> </span>
				</form>


				<!--��ť-->
				
				<!--��ť-->
			</div>
			<!--�������� end-->
<div id="Container">
<!-- 
	<div id="calendar">
	</div>
	 -->
    <div class="collect">
    	<h2><b style="font: red">${user_name }</b> ���³������ͳ��</h2>
        <dl>
        	<dt>�칫���ϰ�:</dt><dd>${statistic.working_date_count }��</dd>
            <dt>��Ϣ��:</dt><dd>${statistic.holidays_count }�� </dd>
            <c:forEach items="${statistic.map}" var="entry">  
            	<dt>${entry.key }:</dt><dd>${entry.value }��</dd>
			</c:forEach>  
           <!--  
            <dt>���</dt><dd>0</dd>
            <dt>����</dt><dd>0</dd>
            <dt>����</dt><dd>0</dd>
            <dt>���</dt><dd>0</dd>
            <dt>���</dt><dd>0</dd>
            <dt>����</dt><dd>0</dd>
            <dt>ɥ��</dt><dd>0</dd>
            <dt>����</dt><dd>0</dd>
            	<c:if test="${entry.key=='����'}">
			  		<dt>�����ϰ�������</dt><dd>${entry.value} </dd>
            	
            	</c:if>
           <dt>�ٵ���������</dt><dd>${statistic.map}</dd>
            <dt>���˴���</dt><dd>0</dd>
            <dt>���򿨳�������</dt><dd>0</dd>
             -->
        </dl>
        <h2>н��ͳ��</h2>
        <dl>
        	<dt>Ӧ��������:</dt><dd>${statistic.working_date_count }</dd>
        	<dt>ʵ��������:</dt><dd>${statistic.working_date_count- statistic.unknown_count}</dd>
        	<dt>����������:</dt><dd>${statistic.unknown_count}</dd>
            <dt>�¼�����:</dt><dd>0</dd>
            <dt>��������:</dt><dd>0</dd>
            	<c:forEach items="${statistic.map}" var="entry">  
            		<c:if test="${entry.key=='�ٵ�-��'}">
            <dt>�ٵ�-������:</dt><dd>
			  		${entry.value}
            </dd>
            	
            	</c:if>
			</c:forEach>  
            <!-- 
            <dt>�ٵ�����:</dt><dd><a title="50Ԫ/ÿ��">${statistic.fine }Ԫ</a></dd> -->

            <dt>��������:</dt><dd>${statistic.working_date_count }</dd>
            <dt>�Ӱ�����:</dt><dd>0</dd>
        </dl>        
    </div>
		
</div>
</body>
</html>


<html>   
<head><title>��תҳ��</title>   
<script language='javascript' type='text/javascript'>   
var secs =3; //����ʱ������   
var URL ;   
function Load(url){   
URL =url;   
for(var i=secs;i>=0;i--)   
{   
window.setTimeout('doUpdate(' + i + ')', (secs-i) * 1000);   
}   
}   
function doUpdate(num)   
{   
document.getElementById('ShowDiv').innerHTML = '��������ȷ��Ա����������'+num+'����Զ����س�ʼ���棡' ;   
if(num == 0) { window.location=URL; }   
}   
</script>   
</head>   
<body>   
<div id="ShowDiv" style="text-align: center;line-height: 260px">
	
</div>   
<script language="javascript">   

Load("http://localhost:8080/attendance/getPersonChecking-in.do"); //Ҫ��ת����ҳ��   
</script>   
</body>   
</html>  


package com.hskj.salary.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import com.hskj.model.AdminUser;
import com.hskj.salary.model.PersonCalendar;
import com.hskj.salary.model.PersonStatistic;
import com.hskj.salary.model.Salary;
import com.hskj.salary.model.SalaryDetail;
import com.hskj.salary.service.AdminUserService;
import com.hskj.salary.service.SalaryService;
import com.hskj.util.DateUtil;
import com.hskj.util.ExcelUtils;


/**
 *
 * Description:  ���ڹ���
 *
 * @author Administrator<lichuan3992413@gmail.com>
 *
 * Create at:   2013-10-16 ����03:09:32 
 */
@Controller
public class SalaryController {

	private Logger log = Logger.getLogger(SalaryController.class);
	
	@Autowired
	private AdminUserService adminService;
	@Autowired
	private SalaryService salaryService;

	@SuppressWarnings("unused")

	/**
	 * ��ȡ���ڼ�¼
	 * 
	 * @param request
	 * @param modelMap
	 * @return
	 */
	@RequestMapping(value = "/getListByMonth.do")
	public String getListByMonth(HttpServletRequest request, ModelMap modelMap) {

		String everyMonth = request.getParameter("every_month");
		List<Salary> list = salaryService.getListByMonth(everyMonth);
		
		modelMap.addAttribute("list", list);
		return "salary/salary";

	}
	
	/**
	 * ��ȡ���˿��ڼ�¼
	 * @param request
	 * @param modelMap
	 * @return
	 */
	@RequestMapping(value = "/getPersonChecking-in.do")
	public String getPersonSalary(HttpServletRequest request, ModelMap modelMap) {
		
		String user_name = request.getParameter("user_name");
		String every_month = request.getParameter("every_month");
		String oa = request.getParameter("oa");
		String type = request.getParameter("type");

		System.out.println(user_name);
		System.out.println(oa);

		if(user_name==null){
			user_name = "�";
		}
		if(every_month==null){
			 SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM");
			 
				every_month = formatter.format(Calendar.getInstance().getTime());
		}
		
		if(every_month!=null&&user_name!=null){

			String[] arr = every_month.split("-");
			
			int mt = 0;
			if(type!=null){
				
				StringBuffer sb = new StringBuffer();
				sb.append(arr[0]).append("-");
				if(type.equals("prev")){
					
					
					mt = (Integer.valueOf(arr[1])-1);
				}else if(type.equals("next")){
					
					mt = (Integer.valueOf(arr[1])+1);
					
				}else if(type.equals("today")){
				 
					mt = 0;
					SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM");
					 
					every_month = formatter.format(Calendar.getInstance().getTime());
				}
				
				
				if(mt!=0){
					
					if(mt>9){
						sb.append(mt);
					}else{
						sb.append("0").append(mt);
					}
					
					every_month = sb.toString();
				}
			}else{
				mt = Integer.valueOf(arr[1])-1;
			}
			
			arr = every_month.split("-");
			
			List<Salary> list = salaryService.getPersonSalary(every_month,user_name);
			List<PersonCalendar> calendars = salaryService.getPersonCalendarByName(user_name);
			
			AdminUser user = adminService.getInfoByAdminName(user_name);
			
			try {
				
				oa = user.getEmp_id();
			} catch (Exception e) {
				return "jump";
			}
			
			PersonStatistic statistic = salaryService.getPersonStatistic(every_month,every_month, oa);
			
			List<PersonCalendar> leaves = salaryService.getPersonAllLeaves(every_month, oa);
			
			
			modelMap.addAttribute("list", list).addAttribute("user_name", user_name).addAttribute("every_month", every_month).addAttribute("oa", oa).addAttribute("year", arr[0]).addAttribute("month",(Integer.valueOf(arr[1])-1) ).addAttribute("calendars",calendars).addAttribute("statistic", statistic).addAttribute("leaves", leaves);
		}
		return "salary/personChecking-in";
		
	}
	
	private String getMapping(String str){
		if(str==null){
			return null;
		}
		
		if(str.equals("����")){
			return "cwb";
		}
		if(str.equals("������")){
			return "jsb";
		}
		if(str.equals("�ͷ���")){
			return "kfb";
		}
		if(str.equals("���ʲ�")){
			return "rzb";
		}
		if(str.equals("������չ��")){
			return "swb";
		}
		if(str.equals("�г�1��")){
			return "scyb";
		}
		if(str.equals("�г�2��")){
			return "sceb";
		}
		if(str.equals("�г�3��")){
			return "scsb";
		}
		if(str.equals("��Ϊ��")){
			return "wwb";
		}
		if(str.equals("�ܾ���")){
			return "zjb";
		}
		return null;
	}
	/**
	 * ��ȡ���˿��ڼ�¼
	 * @param request
	 * @param modelMap
	 * @return
	 */
	@RequestMapping(value = "/getPersonChecking-inByAdmin.do")
	public String getPersonSalaryByAdmin(HttpServletRequest request, ModelMap modelMap,HttpServletResponse response) {
			
		String user_name = request.getParameter("user_name");
		String every_month = request.getParameter("every_month");
		String oa = request.getParameter("oa");
		String type = request.getParameter("type");
		

		String reason = request.getParameter("reason");//�ޣ�ԭ���б�
		String reason2 = request.getParameter("reason2");//�ޣ�ԭ���б�
		String number = request.getParameter("number");//0.5,1
		String click_day = request.getParameter("click_day");
		String forget = request.getParameter("forget");//�ޣ���ǩ������ǩ��
		System.out.println(user_name);
		System.out.println(reason);
		System.out.println(reason2);
		System.out.println(number);
		System.out.println(click_day);
		System.out.println(forget);
		System.out.println(oa);
		if(reason!=null&&forget!=null){
				
				
				Salary salary = new Salary();
				salary.setOa(oa);
				salary.setEvery_date(click_day);
				
				StringBuffer sb_comment = new StringBuffer();
				if(!reason.equals("��")){
					sb_comment.append(reason);
				}
				
				if(!reason2.equals("��")){
					if(!sb_comment.toString().trim().equals("")){
						sb_comment.append(" ");
					}
					sb_comment.append(reason2);
				}
				
					
					if(!sb_comment.toString().trim().equals("")){
						
						String [] arr = sb_comment.toString().split(" ");
						
						if(arr.length>1){
							String str = null;
							if(arr[0].equals(arr[1])){
								str = arr[0]+"һ��";
							}else{
								
								str = arr[0]+"����"+" "+arr[1]+"����";
							}
							sb_comment = new StringBuffer();
							sb_comment.append(str);
							
						}else{
							
							sb_comment.append("");
							if(number.equals("0.5")){
								
								sb_comment.append("����");
							}else{
								sb_comment.append("һ��");
							}
						}
					}
					
				String [] arr = sb_comment.toString().split(" ");
				
				if(arr.length<2){
					if(!arr[0].contains("һ��")){
						
						if(!forget.equals("��")){
							
							if(!sb_comment.toString().trim().equals("")){
								sb_comment.append(" ");
							}
							sb_comment.append(forget);
							
						}
					}
				}
				
				
				//�ٵ�-�⣬�ٵ�-����Ҫ����
				Salary tmp_salary = salaryService.querySalaryByDate(oa, salary.getEvery_date());
				
				if(tmp_salary!=null){
					
					String tmp_comment = tmp_salary.getComment();
					if(tmp_comment!=null){
						
						StringBuffer ss = new StringBuffer();
						if(tmp_comment.contains("�ٵ�-��")){
								
							ss.append("�ٵ�-��").append(" ").append(sb_comment);	
						     sb_comment = ss;
						}else if(tmp_comment.contains("�ٵ�-��")){
							
							ss.append("�ٵ�-��").append(" ").append(sb_comment);	
							 sb_comment = ss;
						}
					}
				}
				
				if(sb_comment.toString().trim().equals("")){
					sb_comment.append("����");
				}
				
				salary.setComment(sb_comment.toString());
				
				salaryService.updateComments(salary,click_day,click_day);
				
				/* RETURN VALUE */
				String[] json = new String[4];
				json[0] = "true"; // RETURN TRUE
				json[1] = oa;
				json[2] = click_day;
				json[3] = reason;
				JSONArray jsonArray = JSONArray.fromObject(json);
				response.setContentType("text/json; charset=UTF-8");
				PrintWriter out = null;
				
				
				try {
					out = response.getWriter();
//					out.write("{jsonReturn:" + jsonArray + "}");
					out.write(jsonArray.toString());
					out.flush();
					out.close();
					
				} catch (IOException e) {
					e.printStackTrace();
				}
				return null;
				
		
		}
		if(user_name==null){
			user_name = "�";
		}
		if(every_month==null){
			 SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM");
			 
				every_month = formatter.format(Calendar.getInstance().getTime());
		}
		
		if(every_month!=null&&user_name!=null){

			String[] arr = every_month.split("-");
			
			int mt = 0;
			if(type!=null){
				
				StringBuffer sb = new StringBuffer();
				sb.append(arr[0]).append("-");
				if(type.equals("prev")){
					
					
					mt = (Integer.valueOf(arr[1])-1);
				}else if(type.equals("next")){
					
					mt = (Integer.valueOf(arr[1])+1);
					
				}else if(type.equals("today")){
				 
					mt = 0;
					SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM");
					 
					every_month = formatter.format(Calendar.getInstance().getTime());
				}
				
				
				if(mt!=0){
					
					if(mt>9){
						sb.append(mt);
					}else{
						sb.append("0").append(mt);
					}
					
					every_month = sb.toString();
				}
			}else{
				mt = Integer.valueOf(arr[1])-1;
			}
			
			arr = every_month.split("-");
			
			List<Salary> list = salaryService.getPersonSalary(every_month,user_name);
			List<PersonCalendar> calendars = salaryService.getPersonCalendarByName(user_name);
			
			AdminUser user = adminService.getInfoByAdminName(user_name);
			try {
				
				oa = user.getEmp_id();
			} catch (Exception e) {
				return "jump";
			}
			
			PersonStatistic statistic = salaryService.getPersonStatistic(every_month,every_month, oa);
			
			List<PersonCalendar> leaves = salaryService.getPersonAllLeaves(every_month, oa);
			
			
			modelMap.addAttribute("list", list).addAttribute("user_name", user_name).addAttribute("every_month", every_month).addAttribute("oa", oa).addAttribute("year", arr[0]).addAttribute("month",(Integer.valueOf(arr[1])-1) ).addAttribute("calendars",calendars).addAttribute("statistic", statistic).addAttribute("leaves", leaves);
		}
		return "salary/personChecking-inByAdmin";
//		return "salary/test";
		
	}
	
	/**
	 * ��ȡ��������
	 * @param request
	 * @param modelMap
	 * @return
	 */
	@RequestMapping(value = "/getPersonCalendar.do")
	public String getPersonCalendar(HttpServletRequest request, ModelMap modelMap) {
		
		String user_name = request.getParameter("user_name");
//		String every_month = request.getParameter("every_month");
		
		List<PersonCalendar> list = salaryService.getPersonCalendarByName(user_name);
		modelMap.addAttribute("list", list).addAttribute("user_name", user_name);
		return "salary/personCalendar";
		
	}
	
	@RequestMapping(value = "/showAllAttendance.do")
	public String showAllAttendance(HttpServletRequest request, ModelMap modelMap) {
		
		String start_month = request.getParameter("start_month");
		String end_month = request.getParameter("end_month");
		String department = request.getParameter("department");
		String emp_id = request.getParameter("emp_id");
		String user_name = request.getParameter("user_name");
		String flag = request.getParameter("flag");
		List<AdminUser> adminUsers = new ArrayList<AdminUser>();
		
		if(department!=null&&!department.equals("")){
			//���ղ��Ų�ѯ
			adminUsers = adminService.getInfoByDepartment(department);
		}else{
			
			if(user_name!=null&&!user_name.equals("")){
				
				adminUsers.add(adminService.getInfoByAdminName(user_name));
				
			}else{
				
				adminUsers = adminService.getListBySort();
			}
		}
		
		if(start_month==null){

			SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM");
			start_month = formatter.format(Calendar.getInstance().getTime());
			end_month = formatter.format(Calendar.getInstance().getTime());
		}
		
		List<PersonStatistic> list = salaryService.getAllPersonStatistic(adminUsers,start_month,end_month);
		//�ϼ�����
		String tag = getMapping(department);
		if(tag==null){
			tag ="quanti";
		}
		modelMap.addAttribute("list", list).addAttribute("user_name", user_name).addAttribute("start_month", start_month).addAttribute("end_month", end_month).addAttribute("every_month", end_month).addAttribute("department", department).addAttribute("tag", tag);
		if(flag!=null){
			
			return "salary/showAllAttendanceByAdmin";
		}else{
			return "salary/showAllAttendance";	
		}
		
	}
	/**�������ط�����ĳ���ڵ���ϸ����
	 * Description:  
	 * @param request
	 * @param response
	 * @param modelMap
	 * @return
	 * @throws Exception
	 * @author baisong
	 * Create at:   Apr 19, 2013 10:46:35 AM 
	 */
	@RequestMapping(value = "/exportAllAttendance.do")
	public String exportgateDataListEverydayBymonth(HttpServletRequest request,
			HttpServletResponse response, ModelMap modelMap) throws Exception{

		String start_month = request.getParameter("start_month");
		String end_month = request.getParameter("end_month");
		String department = request.getParameter("department");
		String emp_id = request.getParameter("emp_id");
		String user_name = request.getParameter("user_name");
		List<AdminUser> adminUsers = new ArrayList<AdminUser>();

		if(department!=null&&!department.equals("")){
			//���ղ��Ų�ѯ
			adminUsers = adminService.getInfoByDepartment(department);
		}else{
			
			if(user_name!=null&&!user_name.equals("")){
				
				adminUsers.add(adminService.getInfoByAdminName(user_name));
				
			}else{
				
				adminUsers = adminService.getListBySort();
			}
		}
		
		if(start_month==null){

			SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM");
			start_month = formatter.format(Calendar.getInstance().getTime());
			end_month = start_month;
		}
		
		List<PersonStatistic> list = salaryService.getAllPersonStatistic(adminUsers,start_month,end_month);
		
		if (list != null && list.size() > 0) {
			int num = list.size() + 1;
			String queryData[][] = new String[num][24]; // [��][��]
			queryData[0][0] = "���";
			queryData[0][1] = "����";
			queryData[0][2] = "Ա������";
			queryData[0][3] = "oa����";
			queryData[0][4] = "�칫���ϰ�����";
			queryData[0][5] = "�������";
			queryData[0][6] = "��������";
			queryData[0][7] = "��������";
			queryData[0][8] = "�������";
			queryData[0][9] = "�������";
			queryData[0][10] = "��������";
			queryData[0][11] = "ɥ������";
			queryData[0][12] = "��������";
			queryData[0][13] = "�ٵ�-������";
			queryData[0][14] = "���˴���";
			queryData[0][15] = "����-������";
			queryData[0][16] = "��������";
			queryData[0][17] = "�¼�����";
			queryData[0][18] = "��������";
			queryData[0][19] = "��������";
			queryData[0][20] = "�����ռӰ�����";
			queryData[0][21] = "��Ϣ�ռӰ�����";
			queryData[0][22] = "�������ռӰ�����";
			queryData[0][23] = "����������";
			for (int i = 1; i <= list.size(); i++) {	
				PersonStatistic tmp = list.get(i - 1);
				queryData[i][0] = i + "";
				queryData[i][1] = tmp.getDepartment();
				queryData[i][2] = tmp.getUser_name();
				queryData[i][3] = tmp.getOa();
				Map<String, Double> map = tmp.getMap();
				
				int count = 3;
				for(String key:map.keySet()){
					count ++;
					String result = String.valueOf(map.get(key));
					if(result==null||result.equals("null")){
						result = "0";
					}
					queryData[i][count] = result;

				}
				
			}
			ExcelUtils.exportExcelData(start_month+"--"+end_month+" ͳ���б�", queryData, "exportDatas.xls", request,
					response);
		}else{
			modelMap.addAttribute("err", "û������!");
			return "forward";
		}
		return null;

	}
	
//	/**
//	 * ��ȡ�򿨼�¼
//	 * 
//	 * @param request
//	 * @param modelMap
//	 * @return
//	 */
//	@RequestMapping(value = "/getDetailListByMonth.do")
//	public String getDetailListByMonth(HttpServletRequest request, ModelMap modelMap) {
//		
//		String user_name = request.getParameter("user_name");
//		List<SalaryDetail> list = salaryService.getDetailListByName(user_name);
//		
//		modelMap.addAttribute("list", list);
//		return "salary/salaryDetail";
//		
//	}
	
	/**
	 * ��ʼ��
	 * 
	 * @param request
	 * @param modelMap
	 * @return
	 */
	@RequestMapping(value = "/init.do")
	public String init(HttpServletRequest request, ModelMap modelMap) {
		
		String every_month = request.getParameter("every_month");
		salaryService.init(every_month);
		
		return "��ʼ�����";
		
	}
	
	
}
package com.hskj.salary.service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.hskj.model.AdminUser;
import com.hskj.salary.mapper.AdminUserMapper;
import com.hskj.salary.mapper.SalaryMapper;
import com.hskj.salary.model.PersonCalendar;
import com.hskj.salary.model.PersonStatistic;
import com.hskj.salary.model.Salary;
import com.hskj.salary.model.SalaryDetail;
import com.hskj.util.PatternTool;
import com.hskj.util.SalaryAlgorithm;

@Service
public class SalaryService {

	@Autowired
	private SalaryMapper salaryMapper;
	@Autowired
	private AdminUserMapper adminUserMapper;
	
	/*********************************************
	 *	����ָ���·ݻ�ȡ�����б�
	 * @author Administrator<lichuan3992413@gmail.com>
	 * Create at:   2013-10-17 ����09:47:25 
	 * @param everyMonth
	 * @return
	 ********************************************/
	public List<Salary> getListByMonth(String everyMonth){
		
		if(everyMonth!=null){
			List<Salary> list = salaryMapper.queryListByMonth(everyMonth);
			Collections.sort(list);
			return list;
		}
		return null;
	}
	
	/*********************************************
	 *	����ָ���·ݣ�ָ������ ��ȡ������Ϣ
	 * @author Administrator<lichuan3992413@gmail.com>
	 * Create at:   2013-10-17 ����09:47:55 
	 * @param every_month
	 * @param user_name
	 * @return
	 ********************************************/
	public List<Salary> getPersonSalary(String every_month,String user_name){
		
		if(every_month!=null&&user_name!=null){
			
			Map<String,String> map = new HashMap<String,String>();
			map.put("every_month", every_month);
			map.put("user_name", user_name);
			
			List<Salary> list = salaryMapper.queryPersonSalary(map);
//			List<PersonCalendar> calendars = getPersonCalendarByName(every_month, user_name);
			
			Collections.sort(list);
			//comment_type����
			commentTypeHandle(list);
			return list;
		}
		return null;
	}
	
	private void commentTypeHandle(List<Salary> list){
		if(list!=null){
			for(Salary each:list){
				
				String comment = each.getComment();

				SimpleDateFormat formatterDate = new SimpleDateFormat("yyyy-MM-dd");
				String current_date = formatterDate.format(Calendar.getInstance().getTime());
				String every_date = each.getEvery_date();
				Map<String,String> map = new HashMap<String,String>();
				map.put("every_month", each.getEvery_month());
				map.put("every_date", each.getEvery_date());
				map.put("oa", each.getOa());
				
				PersonCalendar calendar = salaryMapper.getPersonCalendarByOaDate(map);
				if(calendar!=null){
					if(calendar.getType()<=0){
						
						
						if(current_date.equals(every_date)){
							
							String end_time = calendar.getEnd_time();
							
							SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
							String current_time = formatter.format(Calendar.getInstance().getTime());
							
							if(each.getStatus()==0){
								
								if(current_time.compareTo(end_time)<0){
									comment="δ���°�ʱ�䣬������";
									each.setComment(comment);
								}
							}
						}
					}
				}
				if(comment!=null){
		
					int status = each.getStatus();
					
					if(comment.equals("�ٵ�-��")||comment.equals("�ٵ�-��")){
						each.setComment_type(1);
					}else if(comment.contains("������")||comment.contains("����")){
						each.setComment_type(2);
					}else if(each.getStatus()==1){
						each.setComment_type(3);
					}
				}
			}
		}
	}
	
	public void updateComment(Salary salary){
		
		Map<String,String> map  = new HashMap<String, String>();
//		map.put("id", salary.getId());
		map.put("oa", salary.getOa());
		map.put("user_name", salary.getUser_name());
		map.put("every_month", salary.getEvery_month());
		map.put("every_date", salary.getEvery_date());
		map.put("comment", salary.getComment());
		
		salaryMapper.updateComment(map);
	}
	
	public void updateComments(Salary salary,String start_date,String end_date){
		
		Map<String,String> map  = new HashMap<String, String>();
	
		map.put("oa", salary.getOa());
		map.put("start_date", start_date);
		map.put("end_date", end_date);
		map.put("comment", salary.getComment());
		
		int result = salaryMapper.updateComments(map);
		if(result==0){
			AdminUser user = adminUserMapper.getInfoByEmp_id(salary.getOa());
			map.put("id", user.getAdmin_id());
			map.put("every_month", PatternTool.getMatch(start_date, "(\\d{4}-\\d{2})-\\d{2}.*",1));
			map.put("every_date", start_date);
			map.put("user_name", user.getAdmin_name());
			map.put("department", user.getDepartment());
			//�������
			salaryMapper.insertComment(map);
		}
		System.out.println(result);
	}
	
	public Map<String,List<Salary>> showSalaryListByMonth(String everyMonth){
		
		List<Salary> list = getListByMonth(everyMonth);
		
		Map<String,List<Salary>> map  = new HashMap<String, List<Salary>>();
		if(list!=null){
			for(Salary each:list){
				String user_name = each.getUser_name();
				String department = each.getDepartment();
				String key = department+"_"+user_name;
				
				if(!map.containsKey(key)){
					
					List<Salary> value = new ArrayList<Salary>();
					map.put(key, value);
				}
				map.get(key).add(each);
			}
		}
		return map;
	}
	
	public List<SalaryDetail> getDetailListByName(String userName){
		
		if(userName!=null){
			
			List<SalaryDetail> list = salaryMapper.getDetailListByName(userName);
			
			return list;
		}
		return null;
	}
	
	public List<PersonCalendar> getPersonCalendarByName(String user_name){
		
		if(user_name!=null){
			
			Map<String,String> map = new HashMap<String,String>();
//			map.put("every_month", every_month);
			map.put("user_name", user_name);
			
			List<PersonCalendar> list = salaryMapper.getPersonCalendarByName(map);
			
			return list;
		}
		return null;
	}
	public PersonCalendar getPersonCalendarByOaDate(String every_month,String oa,String every_date){
		
		if(every_month!=null&&oa!=null){
			
			Map<String,String> map = new HashMap<String,String>();
			map.put("every_month", every_month);
			map.put("every_date", every_date);
			map.put("oa", oa);
			
			PersonCalendar calendar = salaryMapper.getPersonCalendarByOaDate(map);
			
			return calendar;
		}
		return null;
	}
	
	/*********************************************
	 * ��ȡָ���·ݣ���Ա���ϰ���δ�����
	 * @author Administrator<lichuan3992413@gmail.com>
	 * Create at:   2013-10-21 ����02:57:43 
	 * @param every_month
	 * @param oa
	 * @return
	 ********************************************/
	public List<PersonCalendar> getPersonLeaves(String every_month,String oa){
		
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
		 
		Map map = new HashMap();
		map.put("every_month", every_month);
		map.put("every_date", formatter.format(Calendar.getInstance().getTime()));
		map.put("oa", oa);
		
		return salaryMapper.getPersonLeaves(map);
	}
	
	
	public List<PersonCalendar> getPersonLeaves(String start_month,String end_month,String oa){
		
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
		 
		Map map = new HashMap();
		map.put("start_month", start_month);
		map.put("end_month", end_month);
		map.put("every_date", formatter.format(Calendar.getInstance().getTime()));
		map.put("oa", oa);
		
		return salaryMapper.getPersonLeaves(map);
	}
	
	public List<PersonCalendar> getPersonAllLeaves(String every_month,String oa){
		
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
		
		Map map = new HashMap();
//		map.put("every_month", every_month);
		map.put("every_date", formatter.format(Calendar.getInstance().getTime()));
		map.put("oa", oa);
		
		return salaryMapper.getPersonAllLeaves(map);
	}
	
	public List<PersonStatistic> getPersonStatistics(String every_month,String oa){
		
		List<PersonStatistic> list = new ArrayList<PersonStatistic>();
		list.add(getPersonStatistic(every_month,every_month, oa));
		return list;
	}
	
//	/*********************************************
//	 *	����ָ���·ݲ鿴ͳ��
//	 * @author Administrator<lichuan3992413@gmail.com>
//	 * Create at:   2013-12-13 ����05:55:05 
//	 * @param adminUsers
//	 * @param every_month
//	 * @return
//	 ********************************************/
//	public List<PersonStatistic> getAllPersonStatisticByMonth(List<AdminUser> adminUsers,String every_month){
//		
//		List<PersonStatistic> list = new ArrayList<PersonStatistic>();
//		if(adminUsers!=null){
//			
//			PersonStatistic all = new PersonStatistic();
//			for(AdminUser each:adminUsers){
//				String oa = each.getEmp_id();
//				PersonStatistic stat = getPersonStatistic(every_month, oa);
//				if(stat!=null){
//					
//					stat.setUser_name(each.getAdmin_name());
//					stat.setDepartment(each.getDepartment());
//					processStatistic(stat);
//					list.add(stat);
//				}
//			}
//		}
//		
//		if(list.size()<1){
//			return null;
//		}
//		return list;
//	}
	
	/*********************************************
	 *	�����·ݶβ鿴ͳ��
	 * @author Administrator<lichuan3992413@gmail.com>
	 * Create at:   2013-12-13 ����05:55:48 
	 * @param adminUsers
	 * @param start_month
	 * @param end_month
	 * @return
	 ********************************************/
	public List<PersonStatistic> getAllPersonStatistic(List<AdminUser> adminUsers,String start_month,String end_month){
		
		List<PersonStatistic> list = new ArrayList<PersonStatistic>();
		if(adminUsers!=null){
			
			PersonStatistic all = new PersonStatistic();
			for(AdminUser each:adminUsers){
				String oa = each.getEmp_id();
				PersonStatistic stat = getPersonStatistic(start_month,end_month, oa);
				if(stat!=null){
					
					stat.setUser_name(each.getAdmin_name());
					stat.setDepartment(each.getDepartment());
					processStatistic(stat);
					list.add(stat);
				}
			}
		}
		
		if(list.size()<1){
			return null;
		}
		return list;
	}

	private void processStatistic(PersonStatistic stat){
		
		if(stat==null){
			return;
		}
		Map<String, Double> map = stat.getMap();
		if(map==null){
			return;
		}
		
		Map<String, Double> statMap = new LinkedHashMap<String, Double>();
		
		statMap.put("�칫���ϰ�", stat.getOffice_date_count());
		
		if(!map.containsKey("�칫���ϰ�")){
			
			map.put("�칫���ϰ�", stat.getOffice_date_count());
		}
		if(!map.containsKey("���")){
			
			statMap.put("���", 0d);
		}else{
			statMap.put("���", map.get("���"));
		}
		
		if(!map.containsKey("����")){
			
			statMap.put("����", 0d);
		}else{
			statMap.put("����", map.get("����"));
		}
		if(!map.containsKey("����")){
			
			statMap.put("����", 0d);
		}else{
			statMap.put("����", map.get("����"));
		}
		if(!map.containsKey("���")){
			
			statMap.put("���", 0d);
		}else{
			statMap.put("���", map.get("���"));
		}
		if(!map.containsKey("���")){
			
			statMap.put("���", 0d);
		}else{
			statMap.put("���", map.get("���"));
		}
		if(!map.containsKey("����")){
			
			statMap.put("����", 0d);
		}else{
			statMap.put("����", map.get("����"));
		}
		if(!map.containsKey("ɥ��")){
			
			statMap.put("ɥ��", 0d);
		}else{
			statMap.put("ɥ��", map.get("ɥ��"));
		}
		if(!map.containsKey("����")){
			
			statMap.put("����", 0d);
		}else{
			statMap.put("����", map.get("����"));
		}
		
		statMap.put("�ٵ���������", (double)stat.getLate_fine());
		
		if(!map.containsKey("���˴���")){
			
			statMap.put("���˴���", 0d);
		}else{
			statMap.put("���˴���", map.get("���˴���"));
		}
		
//		if(!map.containsKey("���򿨳�������")){
//			
//			statMap.put("���򿨳�������", 0d);
//		}else{
//			statMap.put("���򿨳�������", map.get("���򿨳�������"));
//		}
		statMap.put("���򿨳�������", Double.valueOf(stat.getForget_fine()));
		statMap.put("��������", stat.getReal_working_date_count());
		
		if(!map.containsKey("�¼�")){
			
			statMap.put("�¼�����", 0d);
		}else{
			statMap.put("�¼�����", map.get("�¼�"));
		}
		if(!map.containsKey("����")){
			
			statMap.put("��������", 0d);
		}else{
			statMap.put("��������", map.get("����"));
		}
		
		statMap.put("��������", stat.getFanbu_date_count());
		
		if(!map.containsKey("������")){
			
			statMap.put("������", 0d);
		}else{
			statMap.put("������", map.get("������"));
		}
		statMap.put("��Ϣ��", stat.getOvertime_count());
		
		statMap.put("��������", stat.getHoliday_overtime_count());
		statMap.put("������",map.get("������"));
		stat.setMap(statMap);
	}
	
	public PersonStatistic getPersonStatistic(String start_month,String end_month,String oa){
		
		if(start_month!=null&&end_month!=null&&oa!=null){
			
			Map map = new HashMap();
			map.put("start_month", start_month);
			map.put("end_month", end_month);
			map.put("oa", oa);
			map.put("type", 0);
			
			List<PersonStatistic> statistics = salaryMapper.getPersonStatistic(map);
			//����ʱ��
			int working_date_count = salaryMapper.getPersonWorkingDate(map);
			//��Ϣʱ��
			int holidays_count = salaryMapper.getPersonHolidays(map);
			//�Ӱ�ʱ��
			int overtime_count = salaryMapper.getPersonOvertimes(map);
			int holiday_overtime_count = salaryMapper.getPersonHolidayOvertimes(map);
			
			int xiuChanJia_count = salaryMapper.getPersonChanjia(map);//�ݲ���
			
			int remainder = salaryMapper.getPersonCalendarRemander(map);//����ʣ������
			
			List<PersonCalendar> leaves = getPersonLeaves(start_month,end_month, oa);
			
			if(statistics!=null){
				
				PersonStatistic ps = new PersonStatistic();
				ps.setOa(oa);
//				ps.setEvery_month(every_month);
				ps.setHolidays_count(holidays_count);
				ps.setWorking_date_count(working_date_count);
				ps.setOvertime_count(overtime_count);
				ps.setHoliday_overtime_count(holiday_overtime_count);
				
				Map<String,Double> kv = new HashMap<String, Double>();
				
				for(PersonStatistic each:statistics){
					
					String department = each.getDepartment();
					ps.setDepartment(department);
					ps.setId(each.getId());
					statistic(each, kv);
				}
				
				if(kv.containsKey("������")){
					
					kv.put("������", Double.valueOf(kv.get("������")+leaves.size()));
					
				}else{
					if(leaves.size()>0){
						
						kv.put("������", Double.valueOf(leaves.size()));
					}
				}

				double count = 0;
				
				List<String> keys = new ArrayList<String>();
				for(String key:kv.keySet()){
					
					if(key.contains("������")){
						
					   count += kv.get(key);
					   keys.add(key);
					}
				}
				
				for(String key:keys){
					kv.remove(key);
				}
				
				if(count>0){
					
					kv.put("������", Double.valueOf(count));
				}
				//ȥ������
				if(kv.containsKey("����")){
					kv.remove("����");
				}
				//ȥ���ٵ�-�⣬�ٵ�-��
				if(kv.containsKey("�ٵ�-��")){
					ps.setLate_absolve(kv.get("�ٵ�-��").intValue());
					kv.remove("�ٵ�-��");
				}
				if(kv.containsKey("�ٵ�-��")){
					ps.setLate_fine(kv.get("�ٵ�-��").intValue());
					kv.remove("�ٵ�-��");
				}
				if(kv.containsKey("��ǩ��")){
					ps.setForget_checkin(kv.get("��ǩ��").intValue());
					kv.remove("��ǩ��");
				}
				if(kv.containsKey("��ǩ��")){
					
					ps.setForget_checkout(kv.get("��ǩ��").intValue());
					kv.remove("��ǩ��");
				}
				if(ps.getForget_checkin()+ps.getForget_checkout()>=3){
					
					ps.setForget_fine(ps.getForget_checkin()+ps.getForget_checkout()-3);
				}
				ps.setMap(kv);

//				ps.setUnknown_count((Integer)(kv.get("������")));

				//����ʵ�����������칫���ϰ�����
				//�칫���ϰ�+���+����+���+���ݼ�+���+����+ɥ��-�¼�-����=ʵ�ʳ�������
				//��������+�¼�+����=����Ӧ��������
				//��������=�칫���ϰ�+���+����
				double shijia_count = 0;
				double bingjia_count = 0;
				if(kv.containsKey("�¼�")){
					
					shijia_count = kv.get("�¼�");
				}
				if(kv.containsKey("����")){
					
					bingjia_count = kv.get("����");
				}
				
				//����ʵʱ����鿴����Ҫ��ȥ������������
				
				double real_working_date_count = working_date_count-shijia_count-bingjia_count-remainder;
				ps.setReal_working_date_count(real_working_date_count);
				
				double sangjia_count = 0;
				if(kv.containsKey("ɥ��")){
					
					sangjia_count = kv.get("ɥ��");
				}
				
				double chanjia_count = 0;
				if(kv.containsKey("����")){
					
					chanjia_count = kv.get("����");
				}
				if(xiuChanJia_count>0){
					kv.put("�ݲ���", Double.valueOf(xiuChanJia_count));
				}
				
				
				double hunjia_count = 0;
				if(kv.containsKey("���")){
					
					hunjia_count = kv.get("���");
				}
				
				double tiaoxiujia_count = 0;
				if(kv.containsKey("���ݼ�")){
					
					tiaoxiujia_count = kv.get("���ݼ�");
				}
				
				double nianjia_count = 0;
				if(kv.containsKey("���")){
					
					nianjia_count = kv.get("���");
				}
				
				double chuchai_count = 0;
				if(kv.containsKey("����")){
					
					chuchai_count = kv.get("����");
				}
				
				double waichu_count = 0;
				if(kv.containsKey("���")){
					
					waichu_count = kv.get("���");
				}
				
				double office_date_count = real_working_date_count-sangjia_count-chanjia_count-hunjia_count-tiaoxiujia_count-nianjia_count-chuchai_count-waichu_count;
				//��������=�칫���ϰ�+���+����
				ps.setOffice_date_count(office_date_count);
				double fanbu_date_count = office_date_count+waichu_count+tiaoxiujia_count;
				ps.setFanbu_date_count(fanbu_date_count);
				return ps;
			}
			
			return null;
		}
		return null;
	}
	
//	public PersonStatistic getPersonStatistic(String every_month,String oa){
//		
//		if(every_month!=null&&oa!=null){
//			
//			Map map = new HashMap();
//			map.put("every_month", every_month);
//			map.put("oa", oa);
//			map.put("type", 0);
//			
//			List<PersonStatistic> statistics = salaryMapper.getPersonStatistic(map);
//			//����ʱ��
//			int working_date_count = salaryMapper.getPersonWorkingDate(map);
//			//��Ϣʱ��
//			int holidays_count = salaryMapper.getPersonHolidays(map);
//			//�Ӱ�ʱ��
//			int overtime_count = salaryMapper.getPersonOvertimes(map);
//			int holiday_overtime_count = salaryMapper.getPersonHolidayOvertimes(map);
//			
//			int xiuChanJia_count = salaryMapper.getPersonChanjia(map);//�ݲ���
//			
//			int remainder = salaryMapper.getPersonCalendarRemander(map);//����ʣ������
//			
//			List<PersonCalendar> leaves = getPersonLeaves(every_month, oa);
//			
//			if(statistics!=null){
//				
//				PersonStatistic ps = new PersonStatistic();
//				ps.setOa(oa);
//				ps.setEvery_month(every_month);
//				ps.setHolidays_count(holidays_count);
//				ps.setWorking_date_count(working_date_count);
//				ps.setOvertime_count(overtime_count);
//				ps.setHoliday_overtime_count(holiday_overtime_count);
//				
//				Map<String,Double> kv = new HashMap<String, Double>();
//				
//				for(PersonStatistic each:statistics){
//					
//					String department = each.getDepartment();
//					ps.setDepartment(department);
//					ps.setId(each.getId());
//					statistic(each, kv);
//				}
//				
//				if(kv.containsKey("������")){
//					
//					kv.put("������", Double.valueOf(kv.get("������")+leaves.size()));
//					
//				}else{
//					if(leaves.size()>0){
//						
//						kv.put("������", Double.valueOf(leaves.size()));
//					}
//				}
//
//				double count = 0;
//				
//				List<String> keys = new ArrayList<String>();
//				for(String key:kv.keySet()){
//					
//					if(key.contains("������")){
//						
//					   count += kv.get(key);
//					   keys.add(key);
//					}
//				}
//				
//				for(String key:keys){
//					kv.remove(key);
//				}
//				
//				if(count>0){
//					
//					kv.put("������", Double.valueOf(count));
//				}
//				//ȥ������
//				if(kv.containsKey("����")){
//					kv.remove("����");
//				}
//				//ȥ���ٵ�-�⣬�ٵ�-��
//				if(kv.containsKey("�ٵ�-��")){
//					ps.setLate_absolve(kv.get("�ٵ�-��").intValue());
//					kv.remove("�ٵ�-��");
//				}
//				if(kv.containsKey("�ٵ�-��")){
//					ps.setLate_fine(kv.get("�ٵ�-��").intValue());
//					kv.remove("�ٵ�-��");
//				}
//				if(kv.containsKey("��ǩ��")){
//					ps.setForget_checkin(kv.get("��ǩ��").intValue());
//					kv.remove("��ǩ��");
//				}
//				if(kv.containsKey("��ǩ��")){
//					
//					ps.setForget_checkout(kv.get("��ǩ��").intValue());
//					kv.remove("��ǩ��");
//				}
//				if(ps.getForget_checkin()+ps.getForget_checkout()>=3){
//					
//					ps.setForget_fine(ps.getForget_checkin()+ps.getForget_checkout()-3);
//				}
//				ps.setMap(kv);
//
////				ps.setUnknown_count((Integer)(kv.get("������")));
//
//				//����ʵ�����������칫���ϰ�����
//				//�칫���ϰ�+���+����+���+���ݼ�+���+����+ɥ��-�¼�-����=ʵ�ʳ�������
//				//��������+�¼�+����=����Ӧ��������
//				//��������=�칫���ϰ�+���+����
//				double shijia_count = 0;
//				double bingjia_count = 0;
//				if(kv.containsKey("�¼�")){
//					
//					shijia_count = kv.get("�¼�");
//				}
//				if(kv.containsKey("����")){
//					
//					bingjia_count = kv.get("����");
//				}
//				
//				//����ʵʱ����鿴����Ҫ��ȥ������������
//				
//				double real_working_date_count = working_date_count-shijia_count-bingjia_count-remainder;
//				ps.setReal_working_date_count(real_working_date_count);
//				
//				double sangjia_count = 0;
//				if(kv.containsKey("ɥ��")){
//					
//					sangjia_count = kv.get("ɥ��");
//				}
//				
//				double chanjia_count = 0;
//				if(kv.containsKey("����")){
//					
//					chanjia_count = kv.get("����");
//				}
//				if(xiuChanJia_count>0){
//					kv.put("�ݲ���", Double.valueOf(xiuChanJia_count));
//				}
//				
//				
//				double hunjia_count = 0;
//				if(kv.containsKey("���")){
//					
//					hunjia_count = kv.get("���");
//				}
//				
//				double tiaoxiujia_count = 0;
//				if(kv.containsKey("���ݼ�")){
//					
//					tiaoxiujia_count = kv.get("���ݼ�");
//				}
//				
//				double nianjia_count = 0;
//				if(kv.containsKey("���")){
//					
//					nianjia_count = kv.get("���");
//				}
//				
//				double chuchai_count = 0;
//				if(kv.containsKey("����")){
//					
//					chuchai_count = kv.get("����");
//				}
//				
//				double waichu_count = 0;
//				if(kv.containsKey("���")){
//					
//					waichu_count = kv.get("���");
//				}
//				
//				double office_date_count = real_working_date_count-sangjia_count-chanjia_count-hunjia_count-tiaoxiujia_count-nianjia_count-chuchai_count-waichu_count;
//				//��������=�칫���ϰ�+���+����
//				ps.setOffice_date_count(office_date_count);
//				double fanbu_date_count = office_date_count+waichu_count+tiaoxiujia_count;
//				ps.setFanbu_date_count(fanbu_date_count);
//				return ps;
//			}
//			
//			return null;
//		}
//		return null;
//	}
	
	private void process(){
		
	}
	public void init(String every_month){
		
		//����oa��
		adminUserMapper.updateOA();
		
		List<Salary> list = getListByMonth(every_month);	
		if(list!=null){
			
			int count = 0;
			String tmp_oa = null;
			
			for(Salary each:list){
				
				String oa = each.getOa();
				//���ô���
				if(tmp_oa!=null){
					
					if(!tmp_oa.equals(oa)){
						
						count = 0;
					}
				}

				tmp_oa = oa;
				
				String user_name = each.getUser_name();
				String every_date = each.getEvery_date();
				int status = each.getStatus();
//				System.out.println(user_name+each.getOa()+every_month+every_date);
				PersonCalendar calendar = getPersonCalendarByOaDate(every_month,each.getOa(), every_date);
				if(calendar!=null){
					
					if(calendar.getType()<=0){
						
						String result = null;
						if(status==0){
							
							result  = SalaryAlgorithm.calculate(each, calendar);
						
						}else{
							
							result = each.getComment();
//							System.out.println(each.getOa()+user_name+every_date+result);
						}
						
						if(result!=null){
							
							if(result.contains("�ٵ�-��")){
								
								if(count>=3){
									
									result = result.replace("�ٵ�-��","�ٵ�-��" );
								}
								count++;
								
							}
							
//							System.out.println(user_name+" : "+each.getCheckin_time()+"-----"+each.getCheckout_time()+":"+result);
							each.setComment(result);
						}
					}else{
//						System.out.println(user_name+each.getOa()+every_month+every_date);
//						System.out.println("*****************�ǹ���ʱ��򿨼�¼��*****************");
					}
				}else{
					
					System.out.println(user_name+each.getOa()+every_month+every_date);
					System.out.println("*****************"+user_name+" �����������쳣������ϵ����Ա!");
					each.setComment("�����������쳣������ϵ����Ա��");
				}
				
				//�������ݵ����ݿ�
				updateComment(each);
			}
		}
	}
	
	private void statistic(PersonStatistic statistic,Map<String,Double> kv){
		
		//�¼ٰ��� 5�Σ��¼�һ�� 2��,�¼ٰ��� ��ٰ��� 3��
		
		String comment = statistic.getComment();
		int time = statistic.getCount();//����
		if(comment!=null&&!"".equals(comment)){
			
			//����������
			String[] arr  = comment.split("\\s");
			for(String cm : arr){
				
				cm = cm.trim();
				if(cm.equals("")){
					continue;
				}
				//���������죬һ��
				double count = time*1;
				
				if(cm.contains("����")){
					
					count = time*0.5;
				}
				
				if(cm.contains("һ��")){
					count = time*1;
				}
				cm = cm.replaceAll("����", "").replaceAll("һ��", "");
				
				if(kv.containsKey(cm)){
					
					count += kv.get(cm);
				}
				kv.put(cm, count);
				
//				switch (CaseEnum.valueOf(cm)) {
//				
//				case ����:
//					System.out.println("����");
//					
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					
//					break;
//				case �ٵ�_��:
//					System.out.println("�ٵ�-��");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case �ٵ�_��:
//					System.out.println("�ٵ�-��");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ���:
//					System.out.println("���");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ����:
//					System.out.println("����");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ����:
//					System.out.println("����");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ���:
//					System.out.println("���");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ���:
//					System.out.println("���");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ����:
//					System.out.println("����");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ɥ��:
//					System.out.println("ɥ��");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case �¼�:
//					System.out.println("�¼�");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ����:
//					System.out.println("����");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ����:
//					System.out.println("����");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ��ǩ��:
//					System.out.println("��ǩ��");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				case ��ǩ��:
//					System.out.println("��ǩ��");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//
//				default:
//					System.out.println("����");
//					if(kv.containsKey(cm)){
//						
//						count += kv.get(cm);
//					}
//					
//					kv.put(cm, count);
//					break;
//				}
			}
			
			
//			if(comment.equals("�ٵ�-��")){
//				ps.setFine(50*count);
//			}
//			
//			if(comment.startsWith("ֻ��һ���򿨼�¼��������")){
//				comment="������";
//			}
//			
//			if(kv.containsKey("������")){
//				count += kv.get("������");
//			}
//			kv.put(comment, count);
		}
	}
	
	
	public Salary querySalaryByDate(String oa,String every_date){
		
		Map map = new HashMap();
		map.put("every_date", every_date);
		map.put("oa", oa);
		
		return salaryMapper.querySalaryByDate(map);
		
	}	
}

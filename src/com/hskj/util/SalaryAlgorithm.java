package com.hskj.util;

import com.hskj.salary.model.PersonCalendar;
import com.hskj.salary.model.Salary;

public class SalaryAlgorithm {

	public static String calculate(Salary salary,PersonCalendar calendar){
		
		String result = null;
		String checkin_time = salary.getCheckin_time();
		String checkout_time = salary.getCheckout_time();
		String every_date = salary.getEvery_date();
		
		String cal_start_time = calendar.getStart_time();
		String cal_end_time = calendar.getEnd_time();
		String cal_every_date = calendar.getEvery_date();
		
		String type_desc = calendar.getType_desc();
		
		if(checkin_time==null){
			result = "δ�򿨣�������";
			return result;
		}
		
		if(every_date.equals(cal_every_date)){
			
			if(type_desc!=null){
				
				if(type_desc.equals("���")||type_desc.contains("���ռӰ�-")){
					//��ʱ�������°�ʱ��
					result = compareCheckingoutTime(checkout_time, cal_end_time);
					
				}else if(type_desc.equals("ҹ��")){
					//��ʱ�������ϰ�ʱ��
					result = compareCheckinginTime(checkin_time, cal_start_time);
				}else{
					
					if(checkout_time==null||checkin_time.equals(checkout_time)){
						result = "һ���򿨼�¼��������";
						
					}else{
						
						String checkin_result = compareCheckinginTime(checkin_time, cal_start_time);
						String checkout_result = compareCheckingoutTime(checkout_time, cal_end_time);
						
						if(checkin_result!=null){
							result = checkin_result;
						}else if(checkout_result!=null){
							result = checkout_result;
						}
						
						if(checkin_result!=null&&checkout_result!=null){
							
							if(result.equals(checkout_result)){
								
								result = checkin_result;
							}else{
								
								result = checkin_result+"  "+checkout_result;
							}
						}
					}
				}
			}
			
				
			}else{
				System.out.println("&&&&&&&&&&&&&&&&�����쳣��");
			}
			
		if(result==null){
			result = "����";
		}
		return result;
	}
	
	

	/*********************************************
	 * �Ƚ�ǩ��ʱ��
	 * @author Administrator<lichuan3992413@gmail.com>
	 * Create at:   2013-10-28 ����03:55:40 
	 * @param checkin_time
	 * @param cal_start_time
	 * @return
	 ********************************************/
	private static String compareCheckinginTime(String checkin_time,String cal_start_time){
		
		String result = null;
		//��ʱ�������ϰ�ʱ��
		if(checkin_time.compareTo(cal_start_time)>0){
			
			if(DateUtil.getTwoDay(checkin_time, cal_start_time).equals("0")){
				
				int minutes = DateUtil.getTwoMinutes(checkin_time, cal_start_time);
				
				if(minutes<=20){
					
					
					result = "�ٵ�-��";
					//�ٵ�-��  3������
				}else if(20<minutes&&minutes<=60){
					//�ٵ�
					result = "�ٵ�-��";
					
				}else if(60<minutes&&minutes<=240){
					
//					result= "��������";
					result= "�����쳣��������";
				}else{
					
					//����
//					result = "����һ��";
					result = "�����쳣��������";
				}
				
			}
			
			}
		return result;
	}

	/*********************************************
	 *  �Ƚ�ǩ��ʱ��
	 * @author Administrator<lichuan3992413@gmail.com>
	 * Create at:   2013-10-28 ����03:55:34 
	 * @param checkout_time
	 * @param cal_end_time
	 * @return
	 ********************************************/
	private static String compareCheckingoutTime(String checkout_time,String cal_end_time){
		
		String result = null;
		if(cal_end_time!=null&&checkout_time!=null){
			
			if(checkout_time.compareTo(cal_end_time)<0){
				
				result = "�����쳣��������";	
			}
		}else if(cal_end_time==null){
			result = "�����������쳣������ϵ����Ա!";
			
		}else{
			result = "ǩ�����������⣬����ϵ����Ա!";
		}
		return result;
	}
}

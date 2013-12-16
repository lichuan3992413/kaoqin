package com.hskj.salary.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Repository;

import com.hskj.salary.model.PersonCalendar;
import com.hskj.salary.model.PersonStatistic;
import com.hskj.salary.model.Salary;
import com.hskj.salary.model.SalaryDetail;

/**
 *
 * Description:  salary �����
 *
 * @author Administrator<lichuan3992413@gmail.com>
 *
 * Create at:   2013-10-16 ����03:45:05 
 */
@Repository
public interface SalaryMapper {

	// ����every_month���в�ѯ��¼
//	@Select("SELECT * FROM salary WHERE status=0 and every_month = #{every_month} order by department,user_name")
	@Select("SELECT * FROM salary WHERE every_month = #{every_month} order by department,user_name")
	List<Salary> queryListByMonth(String every_month);
	
	@Select("SELECT * FROM salary WHERE status=0 and oa=#{oa} and every_date = #{every_date} ")
	Salary querySalaryByDate(Map<String,String> map);
	
	// ����every_month,user_name���в�ѯ��¼
//	@Select("SELECT sn,status,oa,user_name,id,every_date,every_month,type,comment,department,substring(checkin_time,12) as show_checkin_time,substring(checkout_time,12) as show_checkout_time FROM salary WHERE every_month = #{every_month} and user_name=#{user_name} order by department,user_name")
	@Select("SELECT sn,status,oa,user_name,id,every_date,every_month,type,comment,department,substring(checkin_time,12) as show_checkin_time,substring(checkout_time,12) as show_checkout_time FROM salary WHERE  user_name=#{user_name} order by department,user_name")
	List<Salary> queryPersonSalary(Map<String,String> map);
	
	// ����user_name��ѯ���˴򿨼�¼
	@Select("SELECT * FROM salary_detail WHERE user_name = #{user_name}")
	List<SalaryDetail> getDetailListByName(String user_name);
	
	// ����every_month,user_name��ѯ����������¼
//	@Select("SELECT * FROM person_calendar WHERE every_month=#{every_month} and user_name = #{user_name}")
	@Select("SELECT id,user_name,every_month,type,type_desc,start_time,end_time,start_date,end_date FROM person_calendar WHERE user_name = #{user_name} group by start_date,end_date")
	List<PersonCalendar> getPersonCalendarByName(Map<String,String> map);
	
	// ����every_month,every_date,user_name��ѯ����������¼
	@Select("SELECT * FROM person_calendar WHERE oa=#{oa} and every_month=#{every_month} and every_date=#{every_date} ")
	PersonCalendar getPersonCalendarByOaDate(Map<String,String> map);
	
	// ��ȡ����ʣ������
	@Select("select count(*) from person_calendar where oa=#{oa} and every_month<=#{end_month} and every_month>=#{start_month} and type<=0 and every_date not in (select every_date from salary where oa=#{oa})")
	 int getPersonCalendarRemander(Map<String,String> map);
	
	// ��ȡ����ʣ������
	@Select("select count(*) from person_calendar where oa=#{oa} and every_month=#{every_month} and type=11")
	int getPersonChanjia(Map<String,String> map);
	
	@Select("SELECT comment,id,oa,department,every_month,count(*) as count FROM salary WHERE oa=#{oa} and every_month<=#{end_month} and every_month>=#{start_month} group by comment")
	List<PersonStatistic> getPersonStatistic(Map<String,String> map);
	
	@Select("SELECT count(*) FROM person_calendar WHERE oa=#{oa} and every_month<=#{end_month} and every_month>=#{start_month} and  type=0")
	int getPersonWorkingDate(Map<String,String> map);
	
	@Select("SELECT count(*) FROM person_calendar WHERE oa=#{oa} and every_month<=#{end_month} and every_month>=#{start_month} and  type>0")
	int getPersonHolidays(Map<String,String> map);
	
	@Select("SELECT count(*) FROM person_calendar WHERE oa=#{oa} and every_month<=#{end_month} and every_month>=#{start_month} and  type<-1")
	int getPersonOvertimes(Map<String,String> map);
	
	@Select("SELECT count(*) FROM person_calendar WHERE oa=#{oa} and every_month<=#{end_month} and every_month>=#{start_month} and  type=-1")
	int getPersonHolidayOvertimes(Map<String,String> map);
	
	//���±�ע
	@Update("update salary set comment=#{comment} WHERE oa=#{oa} and every_month=#{every_month} and every_date=#{every_date} and  user_name = #{user_name}")
	void updateComment(Map<String,String> map);
	
	@Update("update salary set comment=#{comment} ,status=1 WHERE  oa=#{oa} and every_date>=#{start_date} and every_date<=#{end_date} ")
	int updateComments(Map<String,String> map);
	
	@Insert("insert into salary values(null,#{id},#{every_date},null,null,#{every_month},null,#{comment},#{user_name} ,#{department},#{oa},1)")
	int insertComment(Map<String,String> map);
	
	// ����every_month,every_date,user_name��ѯ����������¼
	@Select("select * from person_calendar where every_date<#{every_date} and oa=#{oa} and every_month=#{every_month} and  type<=0 and every_date not in (select every_date from salary where every_month=#{every_month} and oa=#{oa} )")
	List<PersonCalendar> getPersonLeaves2(Map<String,String> map);
	
	// ����every_month,every_date,user_name��ѯ����������¼
	@Select("select * from person_calendar where every_date<#{every_date} and oa=#{oa} and every_month>=#{start_month} and every_month<=#{end_month} and  type<=0 and every_date not in (select every_date from salary where every_month>=#{start_month} and every_month<=#{end_month} and oa=#{oa} )")
	List<PersonCalendar> getPersonLeaves(Map<String,String> map);
	
	@Select("select * from person_calendar where oa=#{oa} and every_date<#{every_date} and  type<=0 and every_date not in (select every_date from salary where oa=#{oa} )")
	List<PersonCalendar> getPersonAllLeaves(Map<String,String> map);
}

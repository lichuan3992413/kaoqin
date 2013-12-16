package com.hskj.salary.schedule;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;

import com.hskj.salary.service.SalaryService;


/**
 *
 * Description:�������ģ��  
 *
 * @author lichuan<lichuan3992413@gmail.com>
 *
 * Create at:   2011-7-28 ����09:50:10 
 */
public class DataHandler {

	
	public static Map<Integer,Integer> customerLevelMap;//�û����� Integer:customer_sn ,Integer:customer_trust
	
	@Autowired 
	private SalaryService salaryService;
	
	public void initData(){
        	

        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM");
		 
		String every_month = formatter.format(Calendar.getInstance().getTime());
		
		System.out.println("��ʼ��ʼ�� "+every_month+" ����!");
        salaryService.init(every_month);
		
		System.out.println(every_month+" ��ʼ�����");
    }

}

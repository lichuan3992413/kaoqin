package com.hskj.salary.model;

import java.util.Map;

public class PersonStatistic {

	private String user_name;
	private String id;
	private String oa;
	private String department;
	private String comment;
	private int count;//����
	private int late_absolve;//�ٵ�-�����
	private int late_fine;//�ٵ�-������
	private int forget_checkin;//��ǩ�˴���
	private int forget_fine;//��ǩ��/��ǩ����������
	private int forget_checkout;//��ǩ������
	private String every_month;
	private double working_date_count;//��������
	private double holidays_count;//����
	private double overtime_count;//�Ӱ�
	private double holiday_overtime_count;//���ռӰ�
	private double unknown_count; //δ֪������
	private double office_date_count;//�칫�ҹ�������
	private double real_working_date_count;//ʵ�ʹ�������
	private double fanbu_date_count;//��������
	private int fine;//����
	private Map<String,Double> map;
	public String getComment() {
		return comment;
	}
	public int getCount() {
		return count;
	}
	public String getDepartment() {
		return department;
	}
	public String getEvery_month() {
		return every_month;
	}
	
	public double getFanbu_date_count() {
		return fanbu_date_count;
	}
	public int getFine() {
		return fine;
	}
	public int getForget_checkin() {
		return forget_checkin;
	}
	public int getForget_checkout() {
		return forget_checkout;
	}
	public int getForget_fine() {
		return forget_fine;
	}
	public double getHoliday_overtime_count() {
		return holiday_overtime_count;
	}
	public double getHolidays_count() {
		return holidays_count;
	}
	public String getId() {
		return id;
	}
	public int getLate_absolve() {
		return late_absolve;
	}
	public int getLate_fine() {
		return late_fine;
	}
	public Map<String, Double> getMap() {
		return map;
	}
	public String getOa() {
		return oa;
	}
	public double getOffice_date_count() {
		return office_date_count;
	}
	public double getOvertime_count() {
		return overtime_count;
	}
	public double getReal_working_date_count() {
		return real_working_date_count;
	}
	public double getUnknown_count() {
		return unknown_count;
	}
	public String getUser_name() {
		return user_name;
	}
	public double getWorking_date_count() {
		return working_date_count;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	public void setCount(int count) {
		this.count = count;
	}
	public void setDepartment(String department) {
		this.department = department;
	}
	public void setEvery_month(String everyMonth) {
		every_month = everyMonth;
	}
	public void setFanbu_date_count(double fanbuDateCount) {
		fanbu_date_count = fanbuDateCount;
	}
	public void setFine(int fine) {
		this.fine = fine;
	}
	
	public void setForget_checkin(int forgetCheckin) {
		forget_checkin = forgetCheckin;
	}
	public void setForget_checkout(int forgetCheckout) {
		forget_checkout = forgetCheckout;
	}
	public void setForget_fine(int forgetFine) {
		forget_fine = forgetFine;
	}
	public void setHoliday_overtime_count(double holidayOvertimeCount) {
		holiday_overtime_count = holidayOvertimeCount;
	}
	public void setHolidays_count(double holidaysCount) {
		holidays_count = holidaysCount;
	}
	public void setId(String id) {
		this.id = id;
	}
	public void setLate_absolve(int lateAbsolve) {
		late_absolve = lateAbsolve;
	}
	public void setLate_fine(int lateFine) {
		late_fine = lateFine;
	}
	public void setMap(Map<String, Double> map) {
		this.map = map;
	}
	public void setOa(String oa) {
		this.oa = oa;
	}
	public void setOffice_date_count(double officeDateCount) {
		office_date_count = officeDateCount;
	}
	public void setOvertime_count(double overtimeCount) {
		overtime_count = overtimeCount;
	}
	public void setReal_working_date_count(double realWorkingDateCount) {
		real_working_date_count = realWorkingDateCount;
	}
	public void setUnknown_count(double unknownCount) {
		unknown_count = unknownCount;
	}
	public void setUser_name(String userName) {
		user_name = userName;
	}
	public void setWorking_date_count(double workingDateCount) {
		working_date_count = workingDateCount;
	}
}

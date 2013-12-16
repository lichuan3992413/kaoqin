package com.hskj.salary.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.hskj.model.AdminUser;
import com.hskj.salary.mapper.AdminUserMapper;

/**
 * 
 * @author 1202211 admin_user service
 */

@Service
public class AdminUserService {
		
	@Autowired
	private AdminUserMapper adminUserMapper;
	
	

	public List<AdminUser> queryByUserName(String user_name) {
		
		List<AdminUser> list=adminUserMapper.queryByUserName(user_name);
		
		return list;
	}
	
	public AdminUser getInfoByEmp_id(String emp_id) {

		return adminUserMapper.getInfoByEmp_id(emp_id);
	}
	
	// ͨ��SN��ȡ�û���Ϣ
	public AdminUser getInfoBySn(String sn) {
		return adminUserMapper.getInfoBySn(Integer.parseInt(sn));
	}
	
	public AdminUser getInfoByUseId(String userId) {
		return adminUserMapper.getInfoByUseId(userId);
	}

	public boolean insert(AdminUser adminUser) {
		if (adminUserMapper.insert(adminUser) > 0) {
			return true;
		} else {
			return false;
		}
	}

	
	// ͨ��admin_id��ȡ�û���Ϣ
	public AdminUser getInfoByAdminId(String id) {
		return adminUserMapper.getInfoByAdminId(id);
	}

	// ͨ��admin_name��ȡ�û���Ϣ
	public AdminUser getInfoByAdminName(String admin_name) {
		if(admin_name==null){
			return null;
		}
		return adminUserMapper.getInfoByAdminName(admin_name);
	}
	
	// ͨ��department��ȡ�û���Ϣ
	public List<AdminUser> getInfoByDepartment(String department) {
		if(department==null){
			return null;
		}
		return adminUserMapper.getInfoByDepartment(department);
	}
	
	// ͨ��admin_name��ȡ�û���Ϣ
	public AdminUser getInfoByNAME(String admin_name) {
		return adminUserMapper.getInfoByNAME(admin_name);
	}

	// ��ȡAdmin_user�б�
	public List<AdminUser> getList() {
		return adminUserMapper.getList();
	}
	
	// ��ȡAdmin_user�б�
	public List<AdminUser> getDepartmentList() {
		return adminUserMapper.getDepartmentList();
	}
	
	// ��ȡAdmin_user�б�
	public List<AdminUser> getListBySort() {
		return adminUserMapper.getListBySort();
	}

	public boolean update(AdminUser adminUser) {
		int m = adminUserMapper.update(adminUser);
		if (m >= 0) {

			return true;
		} else {
			return false;

		}

	}

}

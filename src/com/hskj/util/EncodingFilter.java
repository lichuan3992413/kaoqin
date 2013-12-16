/**
 * 
 */
package com.hskj.util;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

/**
 * 
 * @author 1202211
 * 
 */
public class EncodingFilter implements Filter {
	protected String encoding = null;// ///Ҫ�ƶ��ı��룬��web.xml������

	protected FilterConfig filterConfig = null;

	public void destroy() {

		this.encoding = null;
		this.filterConfig = null;

	}

	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {

		if (request.getCharacterEncoding() == null) {
			String encoding = getEncoding();// //�õ�ָ���ı�������
			if (encoding != null)
				request.setCharacterEncoding(encoding);// //����request�ı���
		}

		chain.doFilter(request, response);// /�л���ִ����һ��filter

	}

	public void init(FilterConfig filterConfig) throws ServletException {

		this.filterConfig = filterConfig;
		this.encoding = filterConfig.getInitParameter("encoding");// /�õ���web.xml�����õı���
	}

	protected String getEncoding() {

		return (this.encoding);// /�õ�ָ���ı���

	}

}

<%@ page  pageEncoding = "gb2312" contentType="image/jpeg" import = "javax.imageio.*,java.util.*,java.awt.image.*,java.awt.*" %>
<%!
    //�ڴ˴� ��ȡ�����������ɫ
    Color getRandColor(Random random, int ff, int cc) {
       if (ff > 255)
           ff = 255;
       if (cc > 255)
           cc = 255;
       int r = ff + random.nextInt(cc - ff);
       int g = ff + random.nextInt(cc - ff);
       int b = ff + random.nextInt(cc - ff);
       return new Color(r, g, b);
    } %>
<%
    //�ڴ˴� ����JSPҳ���޻���
    response.setHeader( "Pragma" , "No-cache" );
    response.setHeader( "Cache-Control" , "no-cache" );
    response.setDateHeader( "Expires" , 0);
    // ����ͼƬ�ĳ���
    int width = 130;
    int height = 30;
    //�趨�����ѡȡ�������֣��˴����������ݹ��࣬��һһ�г���ֻ�Ǿ���˵���¡� 
    String base = "0123456789" ;
    //���� ��ѡ������ֵĸ���
    int length = base.length();
    // ��������ͼ��
    BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
    // ��ȡͼ��
    Graphics g = image.getGraphics();
    // �������������ʵ��
    Random random = new Random();
    //�˴� �趨ͼ�񱳾�ɫ
    g.setColor(getRandColor(random, 188, 235));
    g.fillRect(0, 0, width, height);
    //������� ��ѡ����������
    String[] fontTypes = { "\u5b8b\u4f53" , "\u65b0\u5b8b\u4f53" ,
           "\u9ed1\u4f53" , "\u6977\u4f53" , "\u96b6\u4e66" };
    int fontTypesLength = fontTypes.length;
    // ��ͼƬ������������㣬����ͼƬ�����Ѷ�
    g.setColor(getRandColor(random, 180, 199));
    g.setFont( new Font( "Times New Roman" , Font.PLAIN, 14));
    for ( int i = 0; i < 4; i++) {
       g.drawString( "@*@*@*@*@*@*@*" ,
       0, 5 * (i + 2));
    }
    // ȡ�����������֤�� (4 ������ )
    // �������ɵĺ����ַ���
    String sRand = "" ;
    for ( int i = 0; i < 4; i++) {
       int start = random.nextInt(length);
       String rand = base.substring(start, start + 1);
       sRand += rand;
       // ����ͼƬ���������ɫ
       g.setColor(getRandColor(random, 10, 150));
       // ���������ʽ
       g.setFont( new Font(fontTypes[random.nextInt(fontTypesLength)],
       Font.BOLD, 18 + random.nextInt(6)));
       // ���˺��ֻ�����֤ͼƬ����
       g.drawString(rand, 24 * i + 10 + random.nextInt(8), 24);
    }
    // ����֤�����Session��
    session.setAttribute("code" , sRand);
    g.dispose();
    //�� ͼ�������JSPҳ����
    ImageIO.write(image, "JPEG" , response.getOutputStream());
    //�ر���
    out.clear();
    out=pageContext.pushBody();  
%>
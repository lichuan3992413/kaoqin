/*
 * $Id: om-grid.js,v 1.141 2012/05/09 01:06:08 chentianzhen Exp $
 * operamasks-ui omGrid 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 * 
 * Depends:
 *  om-core.js
 *  om-mouse.js
 *  om-resizable.js
 */
 
/**
     * @name omGrid
     * @class ��������������html�е�table��֧�ֺ�̨����Դ����ҳ���Զ��п���ѡ/��ѡ������ʽ���Զ�������Ⱦ�ȹ��ܡ�<br/><br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>ʹ��Զ������Դ</li>
     *      <li>֧�ַ�ҳչ��</li>
     *      <li>�Զ�����к�</li>
     *      <li>����ĳ�еĿ���Զ����䣨���п�ȵ��ڱ���ܿ����ȥ�����п��֮�ͣ�</li>
     *      <li>�����������Զ����ţ��Զ����Ÿ��еĿ�ȣ�ʹ������Ӧ�����ܿ�ȣ�</li>
     *      <li>���Զ��Ƹ�����ʽ��Ҳ���Ը��ݼ�¼�Ĳ�ͬʹ�ò�ͬ������ʽ</li>
     *      <li>���Զ��Ƹ��е���ʾЧ��</li>
     *      <li>�������ñ�ͷ�ͱ����Զ�����</li>
     *      <li>���Ըı��п�</li>
     *      <li>�ṩ�ḻ���¼�</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" >
     *  $(document).ready(function() {
     *      $('#mytable').omGrid({
     *          height : 250,
     *          width : 600,
     *          limit : 8, //��ҳ��ʾ��ÿҳ��ʾ8��
     *          singleSelect : false, //����checkbox�У�����ѡ��ͬʱ���м�¼
     *          colModel : [    {header:'���',name:'id', width:100, align : 'center'},
     *                          {header:'����',name:'city', width:250, align : 'left',wrap:true},
     *                          {header:'��ַ',name:'address', width:'autoExpand',renderer:function(value,rowData,rowIndex){ return '&lt;b>'+value+'&lt/b>'; }}
     *          ],
     *          dataSource : 'griddata.json' //��̨ȡ����URL
     *      });
     *  });
     * &lt;/script>
     * 
     * &lt;table id="mytable"/>
     * </pre>
     * 
     * colModel����������ģ�ͣ��������˱������������޹ص�չ�֡�����һ��JSON���飬����������ÿһ��item����һ��JSON���󣩴������е�һ�С�����ʹ���������ԣ�<br/>
     * <ol>
     *      <li>header:String���ͣ���ʾ���ı�ͷ���֡���Ĭ��ֵ��</li>
     *      <li>width:Number���ͻ�'autoExpand'�����������200��ʾ���п����200px�������'autoExpand'��ʾ���еĿ���Ǳ���ܿ�ȼ�ȥ�������п��֮�͡�Ĭ��ֵ��60��</li>
     *      <li>align:'left'��'right'��'center'����ʾ���ı�ͷ�ͱ������ֵĶ��뷽ʽ��Ĭ��ֵ��'left'��</li>
     *      <li>name:String���ͣ�˵��������һ��Ҫ��ʾ��̨���ص����ݼ�¼��JSON�����е��ĸ����Ե�ֵ����name:'sex'��ʾ��һ����ʾJSON�����sex���Ե�ֵ����Ĭ��ֵ��</li>
     *      <li>wrap:Boolean���ͣ�˵����һ�еı�ͷ�ͱ��嵱����̫��ʱ�Ƿ������Զ�������ʾ����wrap:true��ʾ��һ�еı�ͷ�ͱ�������ʾʱ�Զ����У�������п����100px���Ǳ���ĳtd���ݿ����120pxʱ���td�������Զ�������ʾ����Ĭ��ֵ��false��</li>
     *      <li>renderer:Function���ͣ���������ʾ���е�ֵ�ǽ��пͻ��˴�����Ĭ��ֵ������ת��ֱ�����������id��'name'���н���ֱ�Ӱ�JSON�������е�name���Ե�ֵ��ʾ�ڱ���td�У�����ʱ������Ҫ����һЩ�������磺<br/>
     *          <ul>
     *              <li>��td�е�����Ҫ�Ӵֿ���ʹ��
     *                  <pre>
     *      renderer:function(value , rowData , rowIndex){
     *          return '&lt;b>'+value+'&lt;/b>';
     *      }
     *                  </pre>
     *              </li>
     *              <li>�����̨���ص�������sex��0��1��ҳ����Ҫת��Ϊ����'��'��'Ů'����ʹ��
     *                  <pre>
     *      renderer:function(value , rowData , rowIndex){
     *          return value==0?'��':'Ů';
     *      }
     *                  </pre>
     *              </li>
     *              <li>����һ����̨���ص�������score�Ƿ�������Ҫ��100�����Ϊ��ɫ��'����'С��60��ʱ�����ɫ��'������'�����Ĳ��䣬����ʹ��
     *                  <pre>
     *      renderer:function(value , rowData , rowIndex){ 
     *          if(value==100){
     *              return value==100?'&lt;font color="green">����&lt;/font>';
     *          }else if(value&lt;60){
     *              return '&lt;font color="red">������&lt;/font>';
     *          }else{
     *              return value;
     *          }
     *      }
     *                  </pre>
     *              </li>
     *          <ul>
     *      </li>
     * </ol>
     * 
     * ��̨���ص����ݸ�ʽ���£����Բ������ո��еȸ�ʽ���ݣ��������ڵĸ�����˳������⽻������<br/>
     * <pre>
     * {"total":126, "rows":
     *     [
     *         {"address":"CZ88.NET ","city":"IANA������ַ","id":"1"},
     *         {"address":"CZ88.NET ","city":"�Ĵ�����","id":"2"},
     *         {"address":"����","city":"����ʡ","id":"3"},
     *         {"address":"CZ88.NET ","city":"�Ĵ�����","id":"4"},
     *         {"address":"CZ88.NET ","city":"̩��","id":"5"},
     *         {"address":"CZ88.NET ","city":"�ձ�","id":"6"},
     *         {"address":"����","city":"�㶫ʡ","id":"7"},
     *         {"address":"CZ88.NET ","city":"�ձ�","id":"8"}
     *     ]
     * }
     * </pre>
     * 
     * <b>��������˵����</b><br/>
     * ����һ��ʱ�п��ܻᴥ��onRowSelect��onRowDeselect��onRowClick��Щ�¼���һ��һ���������������������ģ�
     * <ol>
     *     <li>��ѡ��һ��ֻ��ѡ��һ�У���񣺢�������л�δ��ѡ�У��ȴ���������ѡ����е�onRowDeselect�¼������ٴ������е�onRowSelect�¼������ڴ������е�onRowClick�¼�������</li>
     *     <li>��ѡ��һ�ο���ѡ����У���񣺢�������л�δ��ѡ�У��ȴ������е�onRowSelect�¼���������������Ѿ�ѡ�У����ȴ������е�onRowDeselect�¼������ڴ������е�onRowClick�¼�������</li>
     * </ol>
     * 
     * �������˵��
     * <ol>
     * 		<li>�������������ʱ�����start��limit�������������������һҳ����ʱurl���Զ������ start=0&limit=20�� </li>
     * </ol>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
;(function($) {
    $.omWidget('om.omGrid', {
        options:/** @lends omGrid#*/{
            //���
            /**
             * ���߶ȣ���λΪpx��
             * @default 462
             * @type Number
             * @example
             * $('.selector').omGrid({height : 300});
             */
            height:462,
            /**
             * ����ȣ���λΪpx��
             * @type Number
             * @default '100%'
             * @example
             * $('.selector').omGrid({width : 600});
             */
            width:'100%',
            /**
             * ������ģ�͡�ÿһ��Ԫ�ض���һ��������������������еĸ������ԣ���Щ���԰���:<br/>
             * header : ��ͷ���֡�<br/>
             * name : ������ģ�Ͷ�Ӧ���ֶΡ�<br/>
             * align : �����ֶ��뷽ʽ������Ϊ'left'��'center'��'right'֮�е�һ����<br/>
             * renderer : �е���Ⱦ����������3��������v��ʾ��ǰֵ��rowData��ʾ��ǰ�����ݣ�rowIndex��ʾ��ǰ�к�(��0��ʼ)��<br/>
             * width : �еĿ�ȣ�ȡֵΪNumber����'autoExpand'��ע��ֻ����һ���б�����Ϊ'autoExpand'���ԡ�<br/>
             * wrap : �Ƿ��Զ����У�ȡֵΪtrue����false��<br/>
             * @type Array[JSON]
             * @default false
             * @example
             * 
             * $(".selector").omGrid({
             *      colModel : [ {
             *              header : '����',          //��ͷ����
             *              name : 'city',          //������ģ�Ͷ�Ӧ���ֶ�
             *              width : 120,            //�п�,�����þ������֣�Ҳ������Ϊ'autoExpand'����ʾ�Զ���չ
             *              align : 'left',         //�����ֶ���
             *              renderer : function(v, rowData , rowIndex) {   //����Ⱦ����������3��������v��ʾ��ǰֵ��rowData��ʾ��ǰ�����ݣ�rowIndex��ʾ��ǰ�к�(��0��ʼ)
             *                  return '&lt;b>'+v+'&lt;/b>';  //������һ�е����ּӴ���ʾ
             *              }
             *          }, {
             *              header : '��ַ',
             *              name : 'address',
             *              align : 'left',
             *              width : 'autoExpand'
             *          } 
             *      ]
             * });
             */
            colModel:false,
            /**
             * �Ƿ��Զ������������Ӧ���Ŀ�ȣ����繲2�е�һ�п��100�ڶ��п��200���򵱱���ܿ����600pxʱ��һ���Զ�����200px�ڶ��п�Ȼ��Զ����400px�����������ܿ����210pxʱ��һ���Զ�����70px�ڶ��п�Ȼ��Զ����140px����<b>ע�⣺ֻ�������еĿ�ȶ�����'autoExpand'ʱ�����ԲŻ������á�</b>
             * @default false
             * @type Boolean
             * @example
             * $('.selector').omGrid({autoFit : true});
             */
            autoFit:false,
            /**
             * �Ƿ����������ʾ����С�
             * @default true
             * @type Boolean
             * @example
             * $('.selector').omGrid({showIndex : false});
             */
            showIndex:true,
            //����Դ
            /**
             * ajaxȡ����ʽ��Ӧ��url��ַ��
             * @type String
             * @default ��
             * @example
             * //�����ʾ�����õ�url����ʾ����griddata.json�����ַȡ����ͬʱ������start��limit�������������
             * //���ļ����뷵��һ�ξ����ض���ʽ����ʽ�ɲο��ĵ��ġ�Ԥ����ҳǩ��˵������JSON���ݣ�omGrid�õ������ݼ������������
             * $('.selector').omGrid({url:'griddata.json'});
             */
            dataSource:false,
             /**
             * ajaxȡ��ʱ���ӵ�����Ķ��������<b>ע�⣺����JSON��valueֵֻ��ʹ����ֵͨ�������������Ϊ{key1:1,key2:'2',key3:0.2,key4:true,key5:undefined}���������ǲ���������Ϊ{key1:[]}��{key2:{a:1,b:2}}����Ϊ[]��{a:1,b:2}��������ֵͨ</b>
             * @type JSON
             * @default {}
             * @example
             * //�����ʾ����Ajaxȡ��ʱ����griddata.json�����ַȡ����ͬʱ������start��limit��googType��localtion��4�����������
             * //������URL��ַ������griddata.json?start=0&limit=10&goodType=1&location=beijing
             * $('.selector').omGrid({url:'griddata.json',extraData:{googType:1,localtion:'beijing'} });
             */
            extraData:{},
            /**
             * ʹ��GET������POST������ȡ���ݣ�ȡֵΪ��'POST'��'GET'��
             * @type String
             * @default 'GET'
             * @example
             * $('.selector').omGrid({method : 'POST'});
             */
            method:'GET',
            /**
             * ����ȡ��ʱ��ʾ�ڷ�ҳ���ϵ���ʾ��
             * @name omGrid#loadingMsg
             * @type String
             * @default '���ڼ������ݣ����Ժ�...'
             * @example
             * $('.selector').omGrid({loadingMsg : 'ȡ����...'});
             */
            //loadingMsg:$.om.lang.omGrid.loadingMsg,
            /**
             * ȡ����ɺ��Ǻ�̨û�з����κ�����ʱ��ʾ�ڷ�ҳ���ϵ���ʾ��
             * @name omGrid#emptyMsg
             * @type String
             * @default 'û������'
             * @example
             * $('.selector').omGrid({emptyMsg : 'No data!'});
             */
            //emptyMsg:$.om.lang.omGrid.emptyMsg,
            /**
             * ȡ����������ʱ��ʾ�ڷ�ҳ���ϵ���ʾ��
             * @name omGrid#errorMsg
             * @type String
             * @default 'ȡ������'
             * @example
             * $('.selector').omGrid({emptyMsg : 'Ӧ���쳣��������վ����Ա��ϵ!'});
             */
            //errorMsg:$.om.lang.omGrid.errorMsg,
            /**
             * ȡ���ɹ����Ԥ����������ȡ���ɹ���ʼ��ʾ����ǰ�Ժ�̨���ص����ݽ���һ��Ԥ����<b>ע�⣺�˷���һ��Ҫ����һ��ֵ</b>��
             * @type Function
             * @default ��
             * @example
             * //����̨���ص����������м�¼��id���Ը�����name���ԣ�����sex�е�0/1�ֱ�ת��Ϊ'��'��'Ů'��
             * //���̨����{"total":35,"rows":[{id:1,sex:0,password:'abc'},{id:2,sex:1,password:'def'}]}
             * //ת������Ϊ{"total":35,"rows":[{name:1,sex:'��',password:'abc'},{name:2,sex:'Ů',password:'def'}]}
             * $('.selector').omGrid({preProcess : function(data){
             *          var temp;
             *          for(var i=0,len=data.rows.length;i&lt;len;i++){
             *              temp=data.rows[i];
             *              temp.name=temp.id;
             *              temp.id=undefined;
             *              temp.sex= temp.sex==0?'��':'Ů';
             *          }
             *          return data;
             *      }
             * });
             */
            preProcess:false,
            //��ҳ
            /**
             * ÿҳ��������������ÿҳҪ��ʾ10�������10��<b>ע�⣺������0�����򲻷�ҳ</b>�������Խ�����ȡ����������ʾ�������limit���10��ȡ��ʱ���ߺ�̨Ҫ10�����ݣ������̨��Ҫ����15�����ݣ���ҳ�����ʾ��15��������10�����ݣ���
             * @type Number
             * @default 15
             * @example
             * $('.selector').omGrid({limit : 15});
             */
            limit:15,
            /**
             * ��ʾ�ڷ�ҳ���ϡ���һҳ���͡���һҳ����ť֮������֡�����ʾʱ���е�{totalPage}�ᱻ�滻Ϊ��ҳ����{index}�ᱻ�滻Ϊһ�������Ĭ����ʾ��ǰ��ҳ�ţ��û�����������������Ȼ��س�����ת��ָ����ҳ����
             * @name omGrid#pageText
             * @type String
             * @default '��{index}ҳ����{totalPage}ҳ'
             * @example
             * $('.selector').omGrid({pageText : '��{totalPage}ҳ��ת��{index}ҳ'});
             */
            //pageText:$.om.lang.omGrid.pageText,
            /**
             * ��ʾ�ڷ�ҳ���ϵ�ͳ�����֡�����ʾʱ���е�{total}�ᱻ�滻Ϊ�ܼ�¼����{from}��{to}�ᱻ�滻Ϊ��ǰ��ʾ����ֹ�кš�������ܻ���ʾ��'��125�����ݣ���ʾ21-30��'��
             * @name omGrid#pageStat
             * @type String
             * @default '��{total}�����ݣ���ʾ{from}-{to}��'
             * @example
             * $('.selector').omGrid({pageStat : '�ܹ���{total}����¼����ǰ������ʾ��{from}������{to}��'});
             */
            //pageStat:$.om.lang.omGrid.pageStat,
            //����ʾ
            /**
             * ����ʽ��Ĭ����ʾ�ɰ����ƣ���ż�б�����һ��������Ȼ�û�Ҳ���Զ����3��һѭ����5��һѭ����Ҳ���Զ����һ��Function�����������ݲ�ͬ��ʾ�ɲ�ͬ����ʽ������һ����ʾѧ���ɼ��ı���аѲ�����ļ�¼������ʾ�ɺ�ɫ���������ֵļ�¼������ʾ����ɫ��������
             * @type Array��Function
             * @default ['oddRow','evenRow']
             * @example
             * 
             * //ʾ��1���������е�1/4/7/10...�е�tr�������ʽclass1��
             * //��2/5/8/11...�е�tr�������ʽclass2��
             * //��3/6/9/12...�е�tr�������ʽclass3
             * $('.selector').omGrid({rowClasses : ['class1','class2','class2']});
             * 
             * //ʾ��2�����ֵ��м�����ʽfullMarks����������м�����ʽflunk��������ʹ��Ĭ����ʽ��
             * $('.selector').omGrid({rowClasses : function(rowIndex,rowData){
             *          if(rowData.score==100){
             *              reuturn 'fullMarks';
             *          }else if(rowData.score<60){
             *              return 'flunk';
             *          }
             *      }
             * });
             */
            rowClasses:['oddRow','evenRow'],
            //��ѡ��
            /**
             * �Ƿ�ֻ�ܵ�ѡ��һ��ֻ��ѡ��һ����¼��ѡ��ڶ���ʱ��һ�����Զ�ȡ��ѡ�񣩡�������Ϊfalse��ʾ���Զ�ѡ��ѡ��������ʱԭ���Ѿ�ѡ��Ľ���������ѡ��״̬����<b>ע�⣺���trueʱ���������checkbox�У����false���Զ�����checkbox��</b>��
             * @type Boolean
             * @default true
             * @example
             * $('.selector').omGrid({singleSelect : false});
             */
            singleSelect:true,
            
            /**
             * ��������ı���
             * @type String
             * @default ''
             * @example
             * $('.selector').omGrid({title : 'Data Grid'});
             */
            title: '',
            
            //event
            /**
             * ѡ��һ�м�¼��ִ�еķ�����
             * @event
             * @type Function
             * @param rowIndex �кţ���0��ʼ��
             * @param rowData ѡ������������JSON����
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onRowSelect:function(rowIndex,rowData,event){
             *          alert('the '+rowIndex+'th row has been selected!');
             *      }
             *  });
             */
            onRowSelect:function(rowIndex,rowData,event){},
            /**
             * ȡ��һ�м�¼��ѡ���ִ�еķ�����
             * @event
             * @type Function
             * @param rowIndex �кţ���0��ʼ��
             * @param rowData ѡ������������JSON����
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onRowDeselect:function(rowIndex,rowData,event){
             *          alert('the '+rowIndex+'th row has been deselected!');
             *      }
             *  });
             */
            onRowDeselect:function(rowIndex,rowData,event){},
            /**
             * ����һ�м�¼��ִ�еķ�����
             * @event
             * @type Function
             * @param rowIndex �кţ���0��ʼ��
             * @param rowData ѡ������������JSON����
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onRowClick:function(rowIndex,rowData,event){
             *          alert('the '+rowIndex+'th row has been clicked!city='+rowData.city);
             *      }
             *  });
             */
            onRowClick:function(rowIndex,rowData,event){},
            /**
             * ˫��һ�м�¼��ִ�еķ�����
             * @event
             * @type Function
             * @param rowIndex �кţ���0��ʼ��
             * @param rowData ѡ������������JSON����
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onRowDblClick:function(rowIndex,rowData,event){
             *          alert('the '+rowIndex+'th row has been double clicked!city='+rowData.city);
             *      }
             *  });
             */
            onRowDblClick:function(rowIndex,rowData,event){},
            /**
             * �ı��ҳ<b>֮ǰ</b>ִ�еķ�����<b>ע�⣺����˷�������false�򲻽��з�ҳ�л�����ת</b>��
             * @event
             * @type Function
             * @param type �л����ͣ���'first'��'prev'��'next'��'last'��'input'֮һ��
             * @param newPage Ҫת����ҳ�ţ���1��ʼ����һҳ��1������0��
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onPageChange:function(type,newPage,event){
             *          alert('will goto page '+newPage);
             *      }
             *  });
             */
            onPageChange:function(type,newPage,event){},
            /**
             * �Ӻ�̨ȡ���ɹ�ʱִ�еķ�����
             * @event
             * @type Function
             * @param data ȡ���������ݣ� ��ʽ��{"total":35,"rows":[{"id":11,"city":"����ʡ������","address":"����"},{"id":12,"city":"������","address":"���������Ƽ����޹�˾"},{"id":13,"city":"�Ĵ�����","address":"CZ88.NET"}]}  ����
             * @param testStatus ��Ӧ��״̬���ο�jQuery��$.ajax��success���ԣ�
             * @param XMLHttpRequest XMLHttpRequest���󣨲ο�jQuery��$.ajax��success���ԣ�
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onSuccess:function(data,testStatus,XMLHttpRequest,event){
             *          alert('fetch data success,got '+data.rows+' rows');
             *      }
             *  });
             */
            onSuccess:function(data,testStatus,XMLHttpRequest,event){},
            /**
             * �Ӻ�̨ȡ��ʧ��ʱִ�еķ�����
             * @event
             * @type Function
             * @param XMLHttpRequest XMLHttpRequest���󣨲ο�jQuery��$.ajax��error���ԣ�
             * @param testStatus ��Ӧ��״̬���ο�jQuery��$.ajax��error���ԣ�
             * @param errorThrown ������쳣���󣨲ο�jQuery��$.ajax��error���ԣ�
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onError:function(XMLHttpRequest,textStatus,errorThrown,event){
             *          alert('fetch data error');
             *      }
             *  });
             */
            onError:function(XMLHttpRequest,textStatus,errorThrown,event){},
            /**
             * ������ȫ����ʾ�������к�ִ�еķ�����
             * @event
             * @type Function
             * @param nowPage ��ǰҳ��(��һҳ��1�ڶ�ҳ��2)
             * @param pageRecords ��ǰҳ�����м�¼
             * @param event jQuery.Event����
             * @default ��
             * @example
             * //������ʾ����Զ�ѡ�����е�ַ��'����'���С�
             *  $(".selector").omGrid({
             *      signleSelect:false,
             *      onRefresh:function(nowPage,pageRecords,event){
             *          var rows=[];
             *          $(pageRecords).each(function(i){
             *              if(this.address=='����'){
             *                  rows.push(i);
             *              }
             *          });
             *          $('.selector').omGrid('setSelections',rows);
             *      }
             *  });
             */
            onRefresh:function(nowPage,pageRecords,event){},
            /**
             *���ɹ����غ�Ļص��¼��б���Ҫ�����б༭�����(���ڲ�ʹ��)
            */
            _onRefreshCallbacks : [],
            
            /**
             * �������иı��Сʱ�Ļص��¼��б���Ҫ�����б༭�����(���ڲ�ʹ��)
             */
            _omResizableCallbacks : []
        },
        //private methods
        _create:function(){
            var options=this.options,el=this.element.show() // show if hidden
                .attr({
                    cellPadding : 0,
                    cellSpacing : 0,
                    border : 0
                })
                .empty()
                .append('<tbody></tbody>');
            el.wrap('<div class="om-grid om-widget om-widget-content"><div class="bDiv" style="width:100%"></div></div>').closest('.om-grid');
            var colModel=options.colModel;
            if(!$.isArray(colModel)){
                return; //���colModelû���û�ֵ���ԣ�ʲôҲ����
            }
            
            this.hDiv = $('<div class="hDiv om-state-default"></div>').append('<div class="hDivBox"><table cellPadding="0" cellSpacing="0"></table></div>');
            el.parent().before(this.hDiv);
            this.pDiv=$('<div class="pDiv om-state-default"></div>');
            el.parent().after(this.pDiv);
            
            var grid = el.closest('.om-grid');
            this.loadMask=$('<div class="gBlock"><div align="center" class="gBlock-valignMiddle" ><div class="loadingImg" style="display:block"/></div></div>')
                    .mousedown(function(e){
                        return false;  //����˫����Ĭ��˫��ȫ��div���������ȫѡ��
                    })
                    .hide();
            grid.append(this.loadMask);
            
            this.titleDiv = $("<div class='titleDiv'></div>");
            grid.prepend(this.titleDiv);
            
            this.tbody=this.element.children().eq(0);
            this._guid = 0;//����ÿһ�ж����һ�� "_row_id"�Խ���Ψһ��ʶ
        },
        _init:function(){
        	var el=this.element,
        		options = this.options,
                grid = el.closest('.om-grid');
                
        	grid.width(options.width).height(options.height);
        	
            if(!$.isArray(this.options.colModel)){
                return; //���colModelû���û�ֵ���ԣ�ʲôҲ����
            }
            
            this.tbody.empty();
            $('table', this.hDiv).empty();
            this.pDiv.empty();
            this.titleDiv.empty();
            this._buildTableHead();
            this._buildPagingToolBar();
            this._buildLoadMask();
            this._bindSelectAndClickEnvent();
            this._bindScrollEnvent();
            this._makeColsResizable();
            this._buildTitle();
            
            var theadHeight = grid.children('.hDiv').outerHeight(),
                pagingToolBarHeight = grid.children('.pDiv').outerHeight() || 0,
                titleHeight = this.titleDiv.is(":hidden")? 0 : this.titleDiv.outerHeight() || 0,
                tbody = grid.children('.bDiv');
            tbody.height(grid.height()-theadHeight-pagingToolBarHeight-titleHeight);
            this.pageData={nowPage:1,totalPages:1};
            this._populate();
        },
        _buildTitle : function() {
        	var $title = this.titleDiv;
            if (this.options.title) {
                $title.html("<div class='titleContent'>" + this.options.title + "</div>").show();
            }else{
            	$title.empty().hide();
            }
        },
        _buildTableHead:function(){
            var op=this.options,
                el=this.element,
                grid = el.closest('.om-grid'),
                cms=op.colModel,
                allColsWidth = 0, //colModel�Ŀ��
                indexWidth = 0, //colModel�Ŀ��
                checkboxWidth = 0, //colModel�Ŀ��
                autoExpandColIndex = -1;
                thead=$('<thead></thead>');
                tr=$('<tr></tr>').appendTo(thead);
            //��Ⱦ�����
            if(op.showIndex){
                var cell=$('<th></th>').attr({axis:'indexCol',align:'center'}).addClass('indexCol').append($('<div class="indexheader" style="text-align:center;width:25px;"></div>'));
                tr.append(cell);
                indexWidth=25;
            }
            //��Ⱦcheckbox��
            if(!op.singleSelect){
                var cell=$('<th></th>').attr({axis:'checkboxCol',align:'center'}).addClass('checkboxCol').append($('<div class="checkboxheader" style="text-align:center;width:17px;"><span class="checkbox"/></div>'));
                tr.append(cell);
                checkboxWidth=17;
            }
            //��ȾcolModel����
            for (var i=0,len=cms.length;i<len;i++) {
                var cm=cms[i],cmWidth = cm.width || 60,cmAlign=cm.align || 'center';
                if(cmWidth == 'autoExpand'){
                    cmWidth = 0;
                    autoExpandColIndex = i;
                }
                var thCell=$('<div></div>').html(cm.header).css({'text-align':cmAlign,width:cmWidth});
                cm.wrap && thCell.addClass('wrap');
                var th=$('<th></th>').attr('axis', 'col' + i).addClass('col' + i).append(thCell);
                if(cm.name) {
                    th.attr('abbr', cm.name);
                }
                if(cm.align) {
                    th.attr('align',cm.align);
                }
                //var _div=$('<div></div>').html(cm.header).attr('width', cmWidth);
                allColsWidth += cmWidth;
                tr.append(th);
            }
            //tr.append($('<th></th'));
            el.prepend(thead);
            
            
            $('table',this.hDiv).append(thead);
            //�������е��п�
            if(autoExpandColIndex != -1){ //˵����ĳ��Ҫ�Զ�����
                var tableWidth=grid.width()-30,
                	toBeExpandedTh=tr.find('th[axis="col'+autoExpandColIndex+'"] div');
                //��ȻtoBeExpandedTh.parent().width()Ϊ0,����ͬ������ڼ����±ߵ�thead.width()��Ȼ�в���(Chrome)�����Ըɴ��������ˣ���֤�������������thead.width()ֵһ��
                toBeExpandedTh.parent().hide();
                var usableWidth=tableWidth-thead.width();
                toBeExpandedTh.parent().show();
                if(usableWidth<=0){
                    toBeExpandedTh.css('width',60);
                }else{
                    toBeExpandedTh.css('width',usableWidth);
                }
            }else if(op.autoFit){
                var tableWidth=grid.width()-20,
                    usableWidth=tableWidth-thead.width(),
                    percent=1+usableWidth/allColsWidth,
                    toFixedThs=tr.find('th[axis^="col"] div');
                for (var i=0,len=cms.length;i<len;i++) {
                    var col=toFixedThs.eq(i);
                    col.css('width',parseInt(col.width()*percent));
                }
            }
            this.thead=thead;
            thead = null;
        },
        _buildPagingToolBar:function(){
            var op=this.options;
            if(op.limit<=0){
                return;
            }
            var self=this,
                el=this.element,
                pDiv= this.pDiv;
            pDiv.html('<div class="pDiv2">'+
                    '<div class="pGroup">'+
                    '<div class="pFirst pButton om-icon"><span class="om-icon-seek-start"></span></div>'+
                    '<div class="pPrev pButton om-icon"><span class="om-icon-seek-prev"></span></div>'+
                '</div>'+
                '<div class="btnseparator"></div>'+
                '<div class="pGroup"><span class="pControl"></span></div>'+
                '<div class="btnseparator"></div>'+
                '<div class="pGroup">'+
                    '<div class="pNext pButton om-icon"><span class="om-icon-seek-next"></span></div>'+
                    '<div class="pLast pButton om-icon"><span class="om-icon-seek-end"></span></div>'+
                '</div>'+
                '<div class="btnseparator"></div>'+
                '<div class="pGroup">'+
                    '<div class="pReload pButton om-icon"><span class="om-icon-refresh"></span></div>'+
                '</div>'+
                '<div class="btnseparator"></div>'+
                '<div class="pGroup"><span class="pPageStat"></span></div>'+
            	'</div>');
            var pageText = $.om.lang._get(op,"omGrid","pageText").replace(/{totalPage}/, '<span>1</span>').replace(/{index}/, '<input type="text" size="4" value="1" />');
            $('.pControl',pDiv).html(pageText);
            el.parent().after(pDiv);
            $('.pReload', pDiv).click(function() {
                self._populate();
            });
            $('.pFirst', pDiv).click(function() {
                self._changePage('first');
            });
            $('.pPrev', pDiv).click(function() {
                self._changePage('prev');
            });
            $('.pNext', pDiv).click(function() {
                self._changePage('next');
            });
            $('.pLast', pDiv).click(function() {
                self._changePage('last');
            });
            $('.pControl input', pDiv).keydown(function(e) {
                if (e.keyCode == $.om.keyCode.ENTER) {
					self._changePage('input');
				}
            });
            $('.pButton', pDiv).hover(function() {
                $(this).addClass('om-state-hover');
            }, function() {
                $(this).removeClass('om-state-hover');
            });
            this.pager=pDiv;
        },
        _buildLoadMask:function(){
            var grid = this.element.closest('.om-grid');
            this.loadMask.css({width:grid.width(),height:grid.height()});
        },
        _changePage : function(ctype) { // change page
            if (this.loading) {
                return true;
            }
            var el=this.element,
                op=this.options,
                grid = el.closest('.om-grid'),
                pageData = this.pageData,
                nowPage=pageData.nowPage,
                totalPages=pageData.totalPages,
                newPage = nowPage;
            this._oldPage = nowPage;//����þɵ�ҳ������Щ�����sort����Ҫ�õ���
            switch (ctype) {
                case 'first':
                    newPage = 1;
                    break;
                case 'prev':
                    if (nowPage > 1) {
                        newPage = nowPage - 1;
                    }
                    break;
                case 'next':
                    if (nowPage < totalPages) {
                        newPage = nowPage + 1;
                    }
                    break;
                case 'last':
                    newPage = totalPages;
                    break;
                case 'input':
                    var nv = parseInt($('.pControl input', el.closest('.om-grid')).val());
                    if (isNaN(nv)) {
                        nv = nowPage;
                    }
                    if (nv < 1) {
                        nv = 1;
                    } else if (nv > totalPages) {
                        nv = totalPages;
                    }
                    $('.pControl input', this.pDiv).val(nv);
                    newPage = nv;
                    break;
                default:
                    if (/\d/.test(ctype)) {
                        var nv = parseInt(ctype);
                        if (isNaN(nv)) {
                            nv = 1;
                        }
                        if (nv < 1) {
                            nv = 1;
                        } else if (nv > totalPages) {
                            nv = totalPages;
                        }
                        $('.pControl input', el.closest('.om-grid')).val(nv);
                        newPage = nv;
                    }
            }
            if (newPage == nowPage) {
                return false;
            }
            //�����¼�
            if(this._trigger("onPageChange",null,ctype,newPage)===false){
                return;
            }
            //�޸�pageData
            pageData.nowPage=newPage;
            //��ҳʱȥ��ȫѡ״̬
            $('th.checkboxCol span.checkbox',grid).removeClass('selected');
            //ˢ������
            this._populate();
        },
        //ˢ������
        _populate : function() { // get latest data
            var self=this,
                el = this.element,
                grid = el.closest('.om-grid'),
                op = this.options,
                pageStat = $('.pPageStat', grid);
            if (!op.dataSource) {
                $('.pPageStat', grid).html(op.emptygMsg);
                return false;
            }
            if (this.loading) {
                return true;
            }
            var pageData = this.pageData,
                nowPage = pageData.nowPage || 1,
                loadMask = $('.gBlock',grid);
            //�߱��������ݵ�ǰ�������ˣ�׼������
            this.loading = true;
            pageStat.html($.om.lang._get(op,"omGrid","loadingMsg"));
            loadMask.show();
            var limit = (op.limit<=0)?100000000:op.limit;
            var param =$.extend(true,op.extraData,{
                start : limit * (nowPage - 1),
                limit : limit,
                _time_stamp_ : new Date().getTime()
            });
            $.ajax({
                type : op.method,
                url : op.dataSource,
                data : param,
                dataType : 'json',
                success : function(data,textStatus,request) {
                    var onSuccess = op.onSuccess;
                    if (typeof(onSuccess) == 'function') {
                        self._trigger("onSuccess",null,data,textStatus,request);
                    }
                    self._addData(data);
                    self._trigger("onRefresh",null,nowPage,data.rows);
                    for(var i=0 , len=op._onRefreshCallbacks.length; i<len; i++){
                    	op._onRefreshCallbacks[i].call(self);
                    }
                    loadMask.hide();
                    self.loading = false;
                },
                error : function(XMLHttpRequest, textStatus, errorThrown) {
                    pageStat.html($.om.lang._get(op,"omGrid","errorMsg")).css('color','red');
                    try {
                        var onError = op.onError;
                        if (typeof(onError) == 'function') {
                            onError(XMLHttpRequest, textStatus, errorThrown);
                        }
                    } catch (e) {
                        // do nothing 
                    } finally {
                        loadMask.hide();
                        self.loading = false;
                        return false;
                    }
                    
                }
            });
        },
        _addData:function(data){
            var op = this.options,
                el = this.element,
                grid = el.closest('.om-grid'),
                pageStat = $('.pPageStat', grid),
                preProcess = op.preProcess,
                pageData=this.pageData;
            //Ԥ����
            preProcess && (data=preProcess(data));
            pageData.data=data;
            pageData.totalPages = Math.ceil(data.total/op.limit);
            //ˢ�·�ҳ��
            this._buildPager();
            this._renderDatas();
        },
        _buildPager:function(){
            var op=this.options;
            if(op.limit<=0){
                return;
            }
            var el=this.element,
                pager=this.pager,
                pControl=$('.pControl',pager),
                pageData = this.pageData,
                nowPage=pageData.nowPage,
                totalPages=pageData.totalPages,
                data=pageData.data,
                from=op.limit* (nowPage-1)+1,
                to=from-1+data.rows.length,
                pageStat='';
            if(data.total===0){
                pageStat=$.om.lang._get(op,"omGrid","emptyMsg");
            }else{
                pageStat = $.om.lang._get(op,"omGrid","pageStat").replace(/{from}/, from).replace(/{to}/, to).replace(/{total}/, data.total);
            }
            $('input',pControl).val(nowPage);
            $('span',pControl).html(totalPages);
            $('.pPageStat', pager).html(pageStat);
        },
        _renderDatas:function(){
            var self=this,
                el=this.element,
                op=this.options,
                grid=el.closest('.om-grid'),
                gridHeaderCols=$('.hDiv thead tr:first th',grid),
                rows=this.pageData.data.rows,
                colModel=op.colModel,
                rowClasses=op.rowClasses,
                tbody=$('tbody',el).empty(),
                isRowClassesFn= (typeof rowClasses === 'function'),
                pageData = this.pageData,start=(pageData.nowPage-1)*op.limit,
                tdTmp = "<td align='$' abbr='$' class='$'><div align='$' class='$' style='width:$px'>$</div></td>",//tdģ��
                headerWidth = [],
                bodyContent = [],
                cols,
                j;
            
            self.hDiv.scrollLeft(0);
            
            $(gridHeaderCols).each(function(index){
            	headerWidth[index] = $('div',$(this)).width();
            });
    		
            $.each(rows,function(i, rowData) {
                var rowCls = isRowClassesFn? rowClasses(i,rowData):rowClasses[i % rowClasses.length];
                var rowValues=self._buildRowCellValues(colModel,rowData,i);
                bodyContent.push("<tr _grid_row_id="+(self._guid++)+" class='om-grid-row " + rowCls + "'>");
               
               	$(gridHeaderCols).each(function(index){
                    var axis = $(this).attr('axis'),wrap=false,html;
                    if(axis == 'indexCol'){
                        html=i+start+1;
                    }else if(axis == 'checkboxCol'){
                        html = '<span class="checkbox"/>';
                    }else if(axis.substring(0,3)=='col'){
                        var colIndex=axis.substring(3);
                        html=rowValues[colIndex];
                        if(colModel[colIndex].wrap){
							wrap=true;
						} 
                    }else{
                        html='';
                    }
                    cols = [this.align , this.abbr , axis , this.align , wrap?'wrap':'', headerWidth[index] , html];
                    j=0;
                    bodyContent.push(tdTmp.replace(/\$/g , function(){
                    	return cols[j++];
                    }));
                });
                bodyContent.push("</tr>");
            });
           	tbody.html(bodyContent.join(" ")); 
        },
        _buildRowCellValues:function(colModel,rowData,rowIndex){
            var len=colModel.length,values=[];
            for(var i=0;i<len;i++){
                var c=colModel[i],
                	v,
                	r=c.renderer;
                if(c.name.indexOf(".") > 0){
                	var properties = c.name.split("."),
                		j = 1,
                		length = properties.length,
                		v = rowData[properties[0]];
                	while(j<length && v && (v=v[properties[j++]]) != undefined){}
                }
                v = v || rowData[c.name] || "";
                if(typeof r === 'function'){
                    v=r(v,rowData,rowIndex);
                }
                values[i]=v;
                v = null;
            }
            return values;
        },
        //����ˮƽ������ʱ�ñ�ͷ�ͱ���һ����������û�����������ֻ�б����������ͷ���ᶯ����ͷ�ͱ���ͶԲ����ˣ�
        _bindScrollEnvent:function(){
            var hDiv=this.thead.closest('.hDiv');
            this.tbody.closest('.bDiv').scroll(function(){
                hDiv.scrollLeft($(this).scrollLeft());
            });
        },
        //����ѡ��/�з�ѡ/�е���/��˫�����¼�����
        _bindSelectAndClickEnvent:function(){
            var self=this;
            //�����checkbox������¼�
            if(!this.options.singleSelect){ //���Զ�ѡ
                // ȫѡ/��ѡ,����Ҫˢ��headerChekcbox��ѡ��״̬
                $('th.checkboxCol span.checkbox',this.thead).click(function(){
                    var thCheckbox=$(this),trSize=self._getTrs().size();
                    if(thCheckbox.hasClass('selected')){ //˵����Ҫȫ��ȡ��ѡ��
                        thCheckbox.removeClass('selected');
                        for(var i=0;i<trSize;i++){
                            self._rowDeSelect(i);
                        }
                    }else{ //˵����Ҫȫѡ
                        thCheckbox.addClass('selected');
                        for(var i=0;i<trSize;i++){
                            self._rowSelect(i);
                        }
                    }
                });
                //�е���,��Ҫˢ��headerChekcbox��ѡ��״̬
                this.tbody.delegate('tr.om-grid-row','click',function(event){
                    var row=$(this),index=self._getRowIndex(row);
                    if(row.hasClass('om-state-highlight')){ //��ѡ��
                        self._rowDeSelect(index);
                    }else{
                        self._rowSelect(index);
                    }
                    self._refreshHeaderCheckBox();
                    self._trigger("onRowClick",event,index,self._getRowData(index));
                });
                //��˫��
                this.tbody.delegate('tr.om-grid-row','dblclick',function(event){
                    var row=$(this),index=self._getRowIndex(row);
                    if(row.hasClass('om-state-highlight')){ //��ѡ��
                        //do nothing
                    }else{
                        self._rowSelect(index);
                        self._refreshHeaderCheckBox();
                    }
                    self._trigger("onRowDblClick",event,index,self._getRowData(index));
                });
            }else{ //���ɶ�ѡ
                //�е���
                this.tbody.delegate('tr.om-grid-row','click',function(event){
                    var row=$(this),index=self._getRowIndex(row);
                    if(row.hasClass('om-state-highlight')){ //��ѡ��
                        // no need to deselect another row and select this row
                    }else{
                        var lastSelectedIndex = self._getRowIndex(self.tbody.find('tr.om-state-highlight:not(:hidden)'));
                        (lastSelectedIndex != -1) && self._rowDeSelect(lastSelectedIndex);
                        self._rowSelect(index);
                    }
                    self._trigger("onRowClick",event,index,self._getRowData(index));
                });
                
                //��˫��,��Ϊ˫��һ�����ȴ������������Զ��ڵ�ѡ���˫��ʱ��һ��һ����ѡ�еģ����Բ���Ҫǿ��˫��ǰѡ��
                this.tbody.delegate('tr.om-grid-row','dblclick',function(event){
                    var index = self._getRowIndex(this);
                    self._trigger("onRowDblClick",event,index,self._getRowData(index));
                });
            }
        },
        _getRowData:function(index){
            return this.pageData.data.rows[index];
        },
        _rowSelect:function(index){
             var el=this.element,
                op=this.options,
                tbody=$('tbody',el),
                tr=this._getTrs().eq(index),
                chk=$('td.checkboxCol span.checkbox',tr);
            tr.addClass('om-state-highlight');
            chk.addClass('selected');
            this._trigger("onRowSelect",null,index,this._getRowData(index));
        },
        _rowDeSelect:function(index){
            var el=this.element,
                op=this.options,
                tbody=$('tbody',el),
                tr=this._getTrs().eq(index),
                chk=$('td.checkboxCol span.checkbox',tr);
            tr.removeClass('om-state-highlight');
            chk.removeClass('selected');
            this._trigger("onRowDeselect",null,index,this._getRowData(index));
        },
        _refreshHeaderCheckBox:function(){
            var selectedRowSize=$('td.checkboxCol span.selected',this.tbody).size(),
                headerCheckbox = $('th.checkboxCol span.checkbox',this.thead);
            if(selectedRowSize < this._getTrs().size()){
                headerCheckbox.removeClass('selected');
            }else{
                headerCheckbox.addClass('selected');
            }
        },
        //���п��Ըı��ȣ�index�к�checkbox�в����Ըı��ȣ�
        _makeColsResizable:function(){
            var self=this,
                bDiv=self.tbody.closest('.bDiv'),
                grid=self.element.closest('.om-grid'),
                $titleDiv = this.titleDiv,
                pDiv=self.pager,
                differWidth;
                
            $('th[axis^="col"] div',self.thead).omResizable({
                handles: 'e',//ֻ��ˮƽ�ı��С
                containment: 'document',
                minWidth: 60,
                resize: function(ui , event) {
                    var _this=$(this),abbr=_this.parent().attr('abbr'),dataCells=$('td[abbr="'+abbr+'"] > div',self.tbody),hDiv=self.thead.closest('.hDiv');
                    _this.width(ui.size.width).height('');
                    dataCells.width(ui.size.width).height('');
                    bDiv.height(grid.height()-($titleDiv.is(":hidden")?0:$titleDiv.outerHeight())-hDiv.outerHeight()-pDiv.outerHeight());
                    hDiv.scrollLeft(bDiv.scrollLeft());
                },
                start: function(ui , event) {
                	differWidth = $(this).parent().width();
                },
                stop: function(ui , event) {
                	var callbacks = self.options._omResizableCallbacks,
                		$th = $(this).parent(),
                		hDiv=self.thead.closest('.hDiv');
                	differWidth = $th.width() - differWidth;
                	for(var i=0,len=callbacks.length; i<len; i++){
                		callbacks[i].call(self , $th , differWidth );
                	}
                	hDiv.scrollLeft(bDiv.scrollLeft());
                }
            });
        },
        //����������������Ϊ�˸�����������grid�������Ϊ�ܶ������tr���в����������б༭������tr�������أ����������ȡ������Ҫע�ⲻ������ͻ��
		_getRowIndex:function(tr){
			return this._getTrs().index(tr);
		},
		//��ȡ�����������У��˷���һ�����Լ������������
		_getTrs:function(){
			return this.tbody.find("tr.om-grid-row:not(:hidden)");		
		},
        //public methods
        /**
         * �޸�ȡ��url������ˢ�����ݡ�һ�����ڲ�ѯ���������翪ʼʱȡ��url��data.json���̨ʵ���յ�data.json?start=0&limit=15���������󡣲�ѯʱʹ��setData������ȡ��url�ĳ�data.json?queryString=admin����̨ʵ���յ�data.json?queryString=admin&start=0&limit=15���������󣬺�̨���ݲ���queryString������ѯ���ɡ�
         * @name omGrid#setData
         * @function
         * @param url �µ�����Դurl
         * @returns jQuery����
         * @example
         *  //ʹ���µ�url��ȡ������������������ʼˢ�±�����ݡ�
         *  $('.selector').omGrid('setData', 'newgriddata.json');
         */
        setData:function(url){
            this.options.dataSource=url;
            this.pageData={nowPage:1,totalPages:1};
            this._populate();
        },
        /**
         * ��ȡ���JSON���ݡ�<br/>
         *     
         * @name omGrid#getData
         * @function
         * @returns ���û������preProcess�򷵻��ɺ�̨�������Ķ��������preProcess�򷵻ش����Ķ���
         * @example
         * //��ȡgrid������Դ
         * var store = $('.selector').omGrid('getData');
         * 
         * 
         */
        getData:function(){
            return this.pageData.data;
        },
        /**
         * ʹ��getData�����Ľ��������Ⱦ���ݡ�<b>ע�⣺�÷��������ᷢ��Ajax���󣬶���������ǰ���ڼ������ݣ�loadmask��δ��ʧ���Ļ���ʲôҲ����ֱ�ӷ���</b>��
         * @name omGrid#refresh
         * @function
         * @returns jQuery����
         * @example
         * //���ݵ�ǰgrid����ģ���е����ݣ�����ˢ��grid
         * $('.selector').omGrid('refresh');//ע��refreshû�д������
         * 
         */
        refresh:function(){
            // �޸�����ģ�ͺ�����ô˷�����ǿ��ˢ�£����ͻ�����Ϊ,�����̨��������
            if (this.loading) {
                return true;
            }
            this.loading = true;
            var op=this.options;
            $('.pPageStat', this.pager).html($.om.lang._get(op,"omGrid","loadingMsg"));
            this.loadMask.show();
            this._buildPager();
            this._renderDatas();
            this._trigger("onRefresh",null,this.pageData.nowPage || 1,this.pageData.data.rows);
            //�����б༭���
            for(var i=0 , len=op._onRefreshCallbacks.length; i<len; i++){
            	op._onRefreshCallbacks[i].call(this);
            }
            this.loadMask.hide();
            this.loading = false;
        },
        /**
         * ˢ�±�����û�в�����ˢ�µ�ǰҳ������в�����ת����������ʾ��ҳ������������Ϸ����Զ�������������<b>ע�⣺�÷����ᷢ��Ajax���󣬶���������ǰ���ڼ������ݣ�loadmask��δ��ʧ���Ļ���ʲôҲ����ֱ�ӷ���</b>��
         * @name omGrid#reload
         * @function
         * @param page Ҫת����ҳ������Ϊ�ձ�ʾˢ�µ�ǰҳ����������������ֻ���С��1���Զ�����Ϊ1���������������ҳ�����Զ�����Ϊ��ҳ����
         * @returns jQuery����
         * @example
         * $('.selector').omGrid('reload');//ˢ�µ�ǰҳ
         * $('.selector').omGrid('reload',3);//ת����3ҳ
         * 
         */
        reload:function(page){
            if (this.loading) {
                return true;
            }
            if(typeof page !=='undefined'){
                page=parseInt(page) || 1;
                if(page<0){
                    page = 1;
                }
                if(page>this.pageData.totalPages){
                    page=this.pageData.totalPages;
                }
                this.pageData.nowPage = page;
            }
            //�൱��goto(page) and reload()����ת����һҳ������ˢ�����ݣ����̨��������
            //û�в���ʱˢ�µ�ǰҳ
            this._populate();
        },
        /**
         * ѡ���С�<b>ע�⣺����Ĳ�������ţ���һ����0�ڶ�����1�����飨����[0,1]��ʾѡ���һ�к͵ڶ��У���Ҫ���������ѡ����ʹ�ÿ�����[]��Ϊ������ֻ�ܴ���������飬���Ҫ�����ӵ�ѡ���㷨�������������ط���������������ô˷������˷������������ѡ��״̬����ѡ���1,2��Ȼ��setSelections([3])�������ֻ�е�3�У���setSelections([3,4]);setSelections([5,6])��ֻ��ѡ��5,6����</b>��
         * @name omGrid#setSelections
         * @function
         * @param indexes ��ţ���һ����0�ڶ�����1�����顣
         * @returns jQuery����
         * @example
         * //ѡ�����еڶ��С������С�������
         * $('.selector').omGrid('setSelections',[1,2,4]);
         * 
         */
        setSelections:function(indexes){
            var self=this;
            if(!$.isArray(indexes)){
                indexes=[indexes];
            }
            var selected=this.getSelections();
            $(selected).each(function(){
                self._rowDeSelect(this);
            });
            $(indexes).each(function(){
                self._rowSelect(this);
            });
            self._refreshHeaderCheckBox();
        },
        /**
         * ��ȡѡ����е��кŻ��м�¼��<b>ע�⣺Ĭ�Ϸ��ص����������ɵ����飨��ѡ���˵�2�к͵�5���򷵻�[1,4]�������Ҫ�����м�¼JSON��ɵ�������Ҫ����һ��true��Ϊ����</b>��
         * @name omGrid#getSelections
         * @function
         * @param needRecords ����Ϊtrueʱ���صĲ����������������м�¼���顣����Ϊ�ջ���trueʱ������������顣
         * @returns jQuery����
         * @example
         * var selectedIndexed = $('.selector').omGrid('getSelections');
         * var selectedRecords = $('.selector').omGrid('getSelections',true);
         * 
         */
        getSelections:function(needRecords){
            //needRecords=trueʱ����Record[],�����Ϊfalseʱ����index[]
            var self=this,
            	selectedTrs=$('tr.om-state-highlight:not(:hidden)',this.tbody),
            	trs = self._getTrs(),
            	result=[];
            if(needRecords){
            	var rowsData = self.getData().rows;
            	selectedTrs.each(function(index , tr){
            		result[result.length] = rowsData[trs.index(tr)];
            	});
            }else{
            	selectedTrs.each(function(index , tr){
            		result[result.length] = trs.index(tr);
            	});
            }
            return result;
        },
        destroy:function(){
        	var $el = this.element;
        	$el.closest('.om-grid').after($el).remove();
        }
    });
    
    $.om.lang.omGrid = {
        loadingMsg:'���ڼ������ݣ����Ժ�...',
        emptyMsg:'û������',
        errorMsg:'ȡ������',
        pageText:'��{index}ҳ����{totalPage}ҳ',
        pageStat:'��{total}�����ݣ���ʾ{from}-{to}��'
    };
})(jQuery);
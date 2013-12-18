/*
 * $Id: om-itemselector.js,v 1.9 2012/03/20 02:41:56 linxiaomin Exp $
 * operamasks-ui omCombo 1.2
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
 *  om-sortable.js
 */
;(function($) {
    /**
     * @name omItemSelector
     * @class �������������������ѡ�б�򣬿��Դ���߽�һЩitem�Ƶ��ұߣ�Ҳ���Դ��ұ߽�һЩitem�Ƶ���ߡ�<br/><br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>����ʹ�ñ�������Դ��Ҳ����ʹ��Զ������Դ</li>
     *      <li>֧������϶��������</li>
     *      <li>�������õġ����ơ������ơ���ȫ�����ơ���ȫ�����ơ������ơ������ơ����ö������õס�����</li>
     *      <li>�ṩ�ḻ���¼�</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" >
     * $(document).ready(function() {
     *     $('#itemselector').omItemSelector({
     *         dataSource:[
     *                  {text:'Java',value:'1'},
     *                  {text:'JavaScript',value:'2'},
     *                  {text:'C',value:'3'},
     *                  {text:'PHP',value:'4'},
     *                  {text:'ASP',value:'5'}
     *         ],
     *         width:250,
     *         height:200
     *     });
     * });
     * &lt;/script>
     * 
     * &lt;div id="itemselector"/>
     * </pre>
     * 
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
    $.omWidget('om.omItemSelector', {
        options: /** @lends omItemSelector#*/{
             /**
              * �����ȡ�
              * @type String
              * @default '250px'
              * @example
              * width : '300px'
              */
             width : '250px',
             /**
              * ����߶ȡ�
              * @type String
              * @default '200px'
              * @example
              * height : '300px'
              */
            height : '200px',
            /**
              * ����Դ���ԣ���������Ϊ����̨��ȡ���ݵ�URL�����ߡ�JSON���ݡ�
              * @type Array[JSON],URL
              * @default []
              * @example
              * dataSource : '/data/items.json' 
              * ����
              * dataSource : [{"value":"001","text":"����"},{"value":"002","text":"����"}]
              * ������������(���ַǱ�׼��itemDataһ��Ҫ���clientFormatterʹ��)
              * dataSource : [{"value":"001","name":"����"},{"value":"002","name":"����"}]
              */
            dataSource : [],
            /**
              * ��ʼֵ����dataSource:[{text:'abc',value:1},{text:'def',value:2},{text:'xyz',value:3}]��value:[2]���������ʾ1��3�������ұ���ʾ��2����
              * @type Array[JSON]
              * @default []
              * @example
              * value : [1,3]
              */
            value : [],
            /**
              * ÿ��dataSource��ÿ��item�����ʾ���б��С�Ĭ�Ͻ���ʾitem���ݵ�text����ֵ��
              * @type Function
              * @default ��
              * @example
              * //����{text:'�й�',value:'zh_CN'}����ʾ��'�й�(zh_CN)'����
              * clientFormatter  : function(itemData,index){
              *     return itemData.text+'('+itemData.value)+')';//����һ��html����
              * }
              * 
              * //����{name:'����',role:'����',value:'PM'}����ʾ�ɺ�ɫ��'����(����)'����
              * //����{name:'����',role:'��ͨԱ��',value:'EMP'}����ʾ�ɺ�ɫ��'����'����
              * clientFormatter  : function(itemData,index){
              *     if(itemData.role=='����'){
              *         return '&lt;font color="red">'+itemData.name+'('+itemData.value)+')&lt;/font>';
              *     }else{
              *         return itemData.name;
              *     }
              * }
              */
            clientFormatter : false,
            /**
              * ��߿�ѡ��ı��⡣
              * @name omItemSelector#availableTitle
              * @type String
              * @default '��ѡ��'
              * @example
              * availableTitle : '�ɼ�����û���'
              */
            //availableTitle : $.om.lang.omItemSelector.availableTitle,
            /**
              * �ұ���ѡ��ı��⡣
              * @name omItemSelector#selectedTitle
              * @type String
              * @default '��ѡ��'
              * @example
              * selectedTitle : '�Ѽ�����û���'
              */
            //selectedTitle : $.om.lang.omItemSelector.selectedTitle,
            /**
              * �Ƿ��Զ�������Ϊtrue��ÿ�ν�item���ƻ�����ʱ�����item�������򣨰���dataSource������Դ��˳�򣩡�<b>ע�⣺���ô˹��ܺ��޷�ʹ���϶������ܣ�Ҳ������ʾ�����ơ������ơ����ö������õס��⼸����ť��</b>
              * @type Boolean
              * @default false
              * @example
              * autoSort : true
              */
            autoSort : false,
            /**
              * ��Ajax���ص�ԭʼ���ݵĽ���Ԥ����ĺ��������в���data�Ƿ��������ص����ݡ�
              * @type Function
              * @field
              * @default ��
              * @example
              * preProcess  : function(data){
              *     return data;//���ﷵ�ش���������
              * }
              */
            preProcess : function(data){
                return data;
            },
            /**
              * ��������ʾ��Щ����ͼ�ꡣ��ͼ�����ŷֱ��ǣ�<ul>
              *     <li>0�����¿հ�����</li>
              *     <li>1����ȫ�����ơ�ͼ��</li>
              *     <li>2�������ơ�ͼ��</li>
              *     <li>3�������ơ�ͼ��</li>
              *     <li>4����ȫ�����ơ�ͼ��</li>
              *     <li>5�����ö���ͼ��</li>
              *     <li>6�������ơ�ͼ��</li>
              *     <li>7�������ơ�ͼ��</li>
              *     <li>8�����õס�ͼ��</li>
              * </ul>�����磺<br/><ul>
              *     <li>[2,3]��ʾ����ʾ�����ơ�ͼ��͡����ơ�ͼ�꣬�ҡ����ơ�ͼ����ǰ�����ơ�ͼ���ں�</li>
              *     <li>[3,2]��ʾ����ʾ�����ơ�ͼ��͡����ơ�ͼ�꣬�ҡ����ơ�ͼ����ǰ�����ơ�ͼ���ں�</li>
              *     <li>[1,2,3,4,5,6,7,8]��ʾ��ʾ����ͼ�꣬�Ұ�������ű�ʾ��˳��</li>
              *     <li>[1,2,3,4,0,5,6,7,8]��ʾ��ʾ����ͼ�꣬�Ұ�������ű�ʾ��˳�����С�ȫ�����ơ��͡��ö���֮���и��հ�����</li>
              *     <li>[1,0,2,0,3,0,4]��ʾ��ʾ��ȫ�����ơ��������ơ��������ơ�����ȫ�����ơ�4��ͼ�꣬����������֮�䶼�и��հ�����</li>
              * </ul>
              * @type Arrat[Number]
              * @default [1,2,3,4]
              * @example
              * toolbarIcons : [1,2,0,3,5,6,7,8]
              */
            toolbarIcons : false,
            /**
             * ��Ajax��ʽ�������ݳ���ʱ�Ļص��������������������һЩ�������������Ի��ķ�ʽ��ʾ�û���
             * @event
             * @param xmlHttpRequest XMLHttpRequest����
             * @param textStatus  ��������
             * @param errorThrown  ������쳣����
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onError:function(xmlHttpRequest, textStatus, errorThrown,event){ 
             *      alert('ȡ������');
             *  } 
             */
            onError : jQuery.noop,
            /**
             * ��Ajax��ʽ�������ݳɹ�ʱ�Ļص��������˷�������Ⱦ��ѡ��item֮ǰִ�С�
             * @event
             * @param data Ajax���󷵻ص�����
             * @param textStatus ��Ӧ��״̬
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onSuccess:function(data, textStatus, event){
             *     if(data.length==0){
             *          alert('û�����ݣ�');
             *     } 
             * }
             */
            onSuccess : jQuery.noop,
            /**
             * ����߽�item�Ƶ��ұ�֮ǰִ�еĶ������������false����item��������ƶ����û�����������¼��н���һЩ�������õĴ�����������˷���Ȼ��return selectedItems.length &lt; 3����ʵ�֡����ֻ��ѡ��3��item���Ĺ���
             * @event
             * @param itemDatas �����ƶ���item��Ӧ��������ɵ����飬����dataSource��[{text:'A',value:0},{text:'B',value:1}]�����ƶ�AʱitemDatas��[{text:'A',value:0}]���ƶ�BʱitemDatas��[{text:'B',value:1}]��ͬʱ�ƶ�A��BʱitemDatas��[{text:'A',value:0},{text:'B',value:1}]
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onBeforeItemSelect:function(itemDatas,event){
             *     alert('�������뵽:'+itemDatas.length+'��Ⱥ��');
             * }
             */
            onBeforeItemSelect : jQuery.noop,
            /**
             * ���ұ߽�item�Ƶ����֮ǰִ�еĶ������������false����item��������ƶ����û�����������¼��н���һЩ�������õĴ���������ʵ�֡�Ա���ǻ�����ɫ���������˳��ý�ɫ���Ĺ���
             * @event
             * @param itemDatas �����ƶ���item��Ӧ��������ɵ����飬����dataSource��[{text:'A',value:0},{text:'B',value:1}]�����ƶ�AʱitemDatas��[{text:'A',value:0}]���ƶ�BʱitemDatas��[{text:'B',value:1}]��ͬʱ�ƶ�A��BʱitemDatas��[{text:'A',value:0},{text:'B',value:1}]
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onBeforeItemDeselect:function(itemDatas,event){
             *     $.each(itemDatas,function(index,data){
             *         if(data.text=='Ա��'){
             *             alert('Ա���ǻ�����ɫ���������˳��ý�ɫ��');
             *             return false;
             *         } 
             *     });
             * }
             */
            onBeforeItemDeselect : jQuery.noop,
            /**
             * ����߽�item�Ƶ��ұ�֮��ִ�еĶ�����
             * @event
             * @param itemDatas �����ƶ���item��Ӧ��������ɵ����飬����dataSource��[{text:'A',value:0},{text:'B',value:1}]�����ƶ�AʱitemDatas��[{text:'A',value:0}]���ƶ�BʱitemDatas��[{text:'B',value:1}]��ͬʱ�ƶ�A��BʱitemDatas��[{text:'A',value:0},{text:'B',value:1}]
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onItemSelect:function(itemDatas,event){
             *      alert('��ո�ѡ����'+itemDatas.length+'����Ŀ');
             * }
             */
            onItemSelect : jQuery.noop,
            /**
             * ���ұ߽�item�Ƶ����֮��ִ�еĶ�����
             * @event
             * @param itemDatas �����ƶ���item��Ӧ��������ɵ����飬����dataSource��[{text:'A',value:0},{text:'B',value:1}]�����ƶ�AʱitemDatas��[{text:'A',value:0}]���ƶ�BʱitemDatas��[{text:'B',value:1}]��ͬʱ�ƶ�A��BʱitemDatas��[{text:'A',value:0},{text:'B',value:1}]
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onItemDeselect :function(itemDatas,event){
             *      alert('��ո�ȥ����'+itemDatas.length+'����Ŀ');
             * }
             */
            onItemDeselect  : jQuery.noop,
            /**
             * �ı�����֮��ִ�еĶ�����
             * @event
             * @param itemData �����ƶ���item��Ӧ�����ݣ�����dataSource��[{text:'A',value:0},{text:'B',value:1}]�����ƶ�AʱitemData��{text:'A',value:0}���ƶ�BʱitemData��{text:'B',value:1}
             * @param oldIndex ԭ������ţ���0��ʼ��
             * @param newIndex �µ���ţ���0��ʼ��
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onSort :function(itemData,oldIndex,newIndex,event){
             *      alert('��ոս���'+itemData.text+'�ӵ�'+(oldIndex+1)+'���Ƶ��˵�'+(newIndex+1)+'��');
             * }
             */
            onSort  : jQuery.noop
        },
        _create:function(){
            this.element.addClass('om-itemselector om-widget').html('<table style="height:100%;width:100%" cellpadding="0" cellspacing="0"><tr><td class="om-itemselector-leftpanel"></td><td class="om-itemselector-toolbar"></td><td class="om-itemselector-rightpanel"></td></tr></table>');
            var tds=$('td',this.element);
            this.leftPanel=$('<fieldset><legend class="om-itemselector-title"><span></span></legend><div class="om-itemselector-items"><dl></dl></div></fieldset>').appendTo(tds.eq(0));
            this.toolbar=$('<div></div>').appendTo(tds.eq(1));
            this.rightPanel=this.leftPanel.clone().appendTo(tds.eq(2));
        },
        _init:function(){
            var op=this.options,
                dataSource=op.dataSource;
            $('>legend>span',this.leftPanel).html($.om.lang._get(op,"omItemSelector","availableTitle"));
            $('>legend>span',this.rightPanel).html($.om.lang._get(op,"omItemSelector","selectedTitle"));
            this.element.css({width:op.width,height:op.height});
            this._buildToolbar();
            this._resizeFieldSet(); //��������fieldset��С
            this._bindEvents();
            if(typeof dataSource ==='string'){
                var self=this;
                $.ajax({
                    url: dataSource,
                    method: 'GET',
                    dataType: 'json',
                    success: function(data, textStatus){
                        if (self._trigger("onSuccess",null,data,textStatus) === false) {
                            return;
                        }
                        data=op.preProcess(data);
                        op.dataSource=data;
                        self._buildList();
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                    	self._trigger("onError",null,XMLHttpRequest, textStatus, errorThrown);
                    }
                });
            }else{
                this._buildList();
            }
        },
        _buildToolbar:function(){
            var op=this.options,
                toolbarIcons=op.toolbarIcons,
                autoSort=op.autoSort,
                html='',
                ALL_ICONS=['space','addAll','add','remove','removeAll','moveTop','moveUp','moveDown','moveBottom'];
            if(!jQuery.isArray(toolbarIcons)){
                toolbarIcons=[1,2,3,4];
            }
            $.each(toolbarIcons,function(index,data){
                var icon=ALL_ICONS[data],title;
                if(!icon || (autoSort&&data>3) ){
                    //toolbar��Ų��Բ���ʾͼ�꣬autoSort=trueʱ����ʾ����ͼ��
                }else{
                    html+='<div class="om-icon om-itemselector-tbar-'+icon+'"'+' title="'+($.om.lang._get({},"omItemSelector",icon+'IconTip') || '')+'"></div>';
                }
            });
            this.toolbar.html(html);
        },
        _resizeFieldSet:function(){
            var lp=this.leftPanel,
                rp=this.rightPanel,
                leftItemsContainer=$('.om-itemselector-items',lp),
                rightItemsContainer=$('.om-itemselector-items',rp),
                H=lp.parent().innerHeight()-leftItemsContainer.offset().top+lp.offset().top,
                W=($('tr',this.element).innerWidth()-this.toolbar.outerWidth())/2,
                innerW=lp.outerWidth(W).innerWidth();
            leftItemsContainer.outerHeight(H).width(innerW);
            rightItemsContainer.outerHeight(H).width(innerW);
        },
        _buildList:function(){
            var op=this.options;
                dataSource = op.dataSource,
                value = op.value,
                fmt=op.clientFormatter,
                leftHtml='',
                rightHtml='',
                // {text:'abc',value:2}��value�Ƿ���value:[0,2,4]������������
                inArray=function(data,valueArr){
                    for(var i=0,len=valueArr.length;i<len;i++){
                        if(data.value===valueArr[i]){
                            return true;
                        }
                    }
                    return false;
                },
                buildHtml=fmt?function(index,data){
                    return '<dt _index="'+index+'">'+fmt(data,index)+'</dt>';
                }:function(index,data){
                    return '<dt _index="'+index+'">'+data.text+'</dt>';
                };
            if($.isArray(dataSource) && jQuery.isArray(value)){
                $.each(dataSource,function(index,data){
                    if(inArray(data,value)){//��value�У�Ҫ�ŵ��ұ�
                        rightHtml+=buildHtml(index,data);
                    }else{//����value��,�ŵ����
                        leftHtml+=buildHtml(index,data);
                    }
                });
            }
            $('.om-itemselector-items>dl',this.leftPanel).html(leftHtml);
            $('.om-itemselector-items>dl',this.rightPanel).html(rightHtml);
            this._makeDraggable();
        },
        _makeDraggable:function(){
            var self=this,
                autoSort=this.options.autoSort,
                allItems=$('.om-itemselector-items>dl',this.element);
            allItems.attr('onselectstart',"javascript:return false;");//��ֹѡ������϶�����
            if(!autoSort){
                allItems.sortable({
                    placeholder:'om-itemselector-placeholder',
                    start:function(ui,event){
                        $('.om-itemselector-items>dl>dt',self.element).removeClass('om-state-highlight');
                        ui.item.addClass('om-state-highlight');
                        ui.item.oldIndex = ui.item.index(); 
                    },
                    stop:function(ui,event){
                    	self._trigger("onSort",null,self.options.dataSource[ui.item.attr('_index')],ui.item.oldIndex,ui.item.index());
                    }
                }).disableSelection();
            }
        },
        _bindEvents:function(){
            var self=this,
                toolbar=this.toolbar,
                op=this.options;
            this.leftPanel.delegate('.om-itemselector-items>dl>dt','click.omItemSelector',function(){
                $('.om-itemselector-items>dl>dt',self.element).removeClass('om-state-highlight');
                $(this).addClass('om-state-highlight');
            });
            this.rightPanel.delegate('.om-itemselector-items>dl>dt','click',function(){
                $('.om-itemselector-items>dl>dt',self.element).removeClass('om-state-highlight');
                $(this).addClass('om-state-highlight');
            });
            //˫��
            this.leftPanel.delegate('.om-itemselector-items>dl>dt','dblclick',function(){
                self._moveItemsToTarget('.om-state-highlight',true);
            });
            this.rightPanel.delegate('.om-itemselector-items>dl>dt','dblclick',function(){
                self._moveItemsToTarget('.om-state-highlight',false);
            });
            //����
            $('.om-itemselector-tbar-add',toolbar).click(function(){
                self._moveItemsToTarget('.om-state-highlight',true);
            });
            //����
            $('.om-itemselector-tbar-remove',toolbar).click(function(){
                self._moveItemsToTarget('.om-state-highlight',false);
            });
            //ȫ������
            $('.om-itemselector-tbar-addAll',toolbar).click(function(){
                self._moveItemsToTarget('',true);
            });
            //ȫ������
            $('.om-itemselector-tbar-removeAll',toolbar).click(function(){
                self._moveItemsToTarget('',false);
            });
            //autoSort=falseʱ�ſ�������
            if(!op.autoSort){
                var selector='.om-itemselector-items>dl>dt.om-state-highlight:first';
                //�ö�
                $('.om-itemselector-tbar-moveTop',toolbar).click(function(){
                    var panel=self.rightPanel,
                        selectedItems=$(selector,panel);
                    if(selectedItems.size()==0){
                        panel=self.leftPanel;
                        selectedItems=$(selector,panel);
                    }
                    var oldIndex=selectedItems.index();
                    if(selectedItems.size()==0 || oldIndex==0)
                        return;
                    selectedItems.prependTo($('.om-itemselector-items>dl',panel));
                    self._trigger("onSort",null,op.dataSource[selectedItems.attr('_index')],oldIndex,0);
                });
                //�õ�
                $('.om-itemselector-tbar-moveBottom',toolbar).click(function(){
                    var panel=self.rightPanel,
                        selectedItems=$(selector,panel);
                    if(selectedItems.size()==0){
                        panel=self.leftPanel;
                        selectedItems=$(selector,panel);
                    }
                    var oldIndex=selectedItems.index(),
                        newIndex=selectedItems.siblings().size();
                    if(selectedItems.size()==0 || oldIndex==newIndex)
                        return;
                    selectedItems.appendTo($('.om-itemselector-items>dl',panel));
                    self._trigger("onSort",null,op.dataSource[selectedItems.attr('_index')],oldIndex,newIndex);
                });
                //����
                $('.om-itemselector-tbar-moveUp',toolbar).click(function(){
                    var panel=self.rightPanel,
                        selectedItems=$(selector,panel);
                    if(selectedItems.size()==0){
                        panel=self.leftPanel;
                        selectedItems=$(selector,panel);
                    }
                    var oldIndex=selectedItems.index();
                    if(selectedItems.size()==0 || oldIndex==0)
                        return;
                    selectedItems.insertBefore(selectedItems.prev());
                    self._trigger("onSort",null,op.dataSource[selectedItems.attr('_index')],oldIndex,oldIndex-1);
                });
                //����
                $('.om-itemselector-tbar-moveDown',toolbar).click(function(){
                    var panel=self.rightPanel,
                        selectedItems=$(selector,panel);
                    if(selectedItems.size()==0){
                        panel=self.leftPanel;
                        selectedItems=$(selector,panel);
                    }
                    var oldIndex=selectedItems.index();
                    if(selectedItems.size()==0 || oldIndex==selectedItems.siblings().size())
                        return;
                    selectedItems.insertAfter(selectedItems.next());
                    self._trigger("onSort",null,op.dataSource[selectedItems.attr('_index')],oldIndex,oldIndex+1);
                });
            }
        },
        _moveItemsToTarget:function(selector,isLeftToRight){
            var formPanel=isLeftToRight?this.leftPanel:this.rightPanel,
                selectedItems=$('.om-itemselector-items>dl>dt'+selector,formPanel);
            if(selectedItems.size()==0)
                return;
            var toPanel=isLeftToRight?this.rightPanel:this.leftPanel,
                op=this.options,
                itemData=[];
            selectedItems.each(function(){
                itemData.push(op.dataSource[$(this).attr('_index')]);
            });
            //�ȴ���onBeforeItemSelect��onBeforeItemDeselect�¼���Ȼ���ƶ�������onItemSelect��onItemDeselect�¼�
            if(isLeftToRight){
                if(this._trigger("onBeforeItemSelect",null,itemData)===false){
                    return;
                }
                selectedItems.appendTo($('.om-itemselector-items>dl',toPanel));
                this._trigger("onItemSelect",null,itemData);
            }else{
                if(this._trigger("onBeforeItemDeselect",null,itemData)===false){
                    return;
                }
                selectedItems.appendTo($('.om-itemselector-items>dl',toPanel));
                this._trigger("onItemDeselect",null,itemData);
            }
            //�������autoSort=true���Զ�����
            if(op.autoSort){
                var result=$('.om-itemselector-items>dl>dt',toPanel).sort(function(a,b){
                    return $(a).attr('_index')-$(b).attr('_index');
                });
                selectedItems.parent().append(result);
            }
        },
        
        /**
         * �õ������������valueֵ��
         * @function
         * @name omItemSelector#value
         * @param v ���õ�ֵ�������ñ�ʾ��ȡֵ
         * @returns ���û�в���ʱ��ʾgetValue()����combo��valueֵ������dataSource:[{text:'abc',value:true},{text:'def',value:2},{text:'xyz',value:'x'}]ѡ���˵�2���͵���������getValue����[2,'x']������в���ʱ��ʾsetValue(newValue)����jQuery����
         * 
         */
        value:function(newValue){
            if(arguments.length==0){ //getValue
                var op=this.options,
                    selectedItems=$('.om-itemselector-items>dl>dt',this.rightPanel),
                    returnValue=[];
                selectedItems.each(function(){
                    returnValue.push(op.dataSource[$(this).attr('_index')].value);
                });
                return returnValue;
            }else{ //setValue
                if($.isArray(newValue)){
                    this.options.value=newValue;
                    this._buildList();
                }
            }
        }
    });
    
    $.om.lang.omItemSelector = {
        availableTitle:'��ѡ��',
        selectedTitle:'��ѡ��',
        addIconTip:'����',
        removeIconTip:'����',
        addAllIconTip:'ȫ������',
        removeAllIconTip:'ȫ������',
        moveUpIconTip:'����',
        moveDownIconTip:'����',
        moveTopIconTip:'�ö�',
        moveBottomIconTip:'�õ�'
    };
})(jQuery);
/*
 * $Id: om-tooltip.js,v 1.12 2012/03/20 06:40:32 luoyegang Exp $
 * operamasks-ui omTooltip 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 */
;(function($) {
    /**
     * @name omTooltip
     * @class ��ʾ�������ĳ�����ӡ�������������Ҫ����������ʾ��ʱ�����ʹ�ñ������
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>��ʾ���ݶ����������������֣�html��ҳ��dom�ڵ㻹�������첽���ص�����</li>
     *      <li>�첽�������ݵ�ʱ��֧��������</li>
     *      <li>����޶Ƚ�Լ��Դ��ֻ����Ҫʹ�õ�ʱ�����ҳ�����domԪ��</li>
     *      <li>֧�����б�׼htmlԪ��</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" &gt;
     * $(document).ready(function() {
     *     $('#tip').omTooltip({
     *         trackMouse : true,
     *         html : '&lt;div style="color:red;"&gt;��ӭʹ��omTooltip���&lt;/div&gt;'
     *     });
     * });
     * &lt;/script&gt;
     * 
     * &lt;input id="tip" type="submit" /&gt;
     * </pre>
     * 
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
    $.omWidget('om.omTooltip', {
        options: /**@lends omTooltip# */{
            /**
             * ��ʾ��Ŀ�ȡ�
             * @type Number 
             * @default 'auto' 
             * @example
             * $("#tip").omTooltip({width: 100}); 
             */
            width : 'auto',
            /**
             * ��С��ȣ�����ʾ���ݺ��ٵ�ʱ��Ϊ����ʽ������ʾָ���Ŀ�ȡ�
             * @type Number 
             * @default null 
             * @example
             * $("#tip").omTooltip({minWidth: 100}); 
             */
            minWidth : null,
            /**
             * ����ȣ�����Ҫ���������Զ���Ӧ��ȶ��ֲ�����Ϊ����̫�������̫������������ʹ��maxWidht����һ������ȡ�
             * @type Number 
             * @default null 
             * @example
             * $("#tip").omTooltip({maxWidth: 200}); 
             */
            maxWidth : null,
            /**
             * ��ʾ��ĸ߶ȡ�
             * @type Number 
             * @default 'auto' 
             * @example
             * $("#tip").omTooltip({height: 100}); 
             */
            height : 'auto',
            /**
             * ���߶ȣ��߶�Ĭ������Ӧ�����ﵽ���߶�֮����������� ��
             * @type Number 
             * @default null 
             * @example
             * $("#tip").omTooltip({maxHeight: 100}); 
             */
            maxHeight : null,
            /**
             * ��С�߶ȡ�
             * @type Number 
             * @default null 
             * @example
             * $("#tip").omTooltip({minHeight: 100}); 
             */
            minHeight : null,
            /**
             * �������Ŀ������֮�󵯳���ʾ����ӳ�ʱ��(ms) ��ͬʱҲ�������ӳٵ��¼���
             * @type Number 
             * @default 300 
             * @example
             * $("#tip").omTooltip({delay: 300}); 
             */
            delay : 300,
            /**
             * �Ƿ���ʾanchor��Ĭ�ϲ���ʾ�����trackMouseΪtrue������ʾ�����Ͻǣ���������棬
             * �����region����ȷ������ͷ�ķ�����Զָ����ʾ��Ŀ�ꡣ
             * @type Boolean 
             * @default false 
             * @example
             * $("#tip").omTooltip({anchor: false}); 
             */
            anchor : false,
            /**
             * ��ʾ���Ƿ��������ƶ�,Ĭ�ϲ���������ƶ�������Ϊtrue���������ƶ���
             * ��region���ȼ��͡�
             * @type Boolean 
             * @default false 
             * @example
             * $("#tip").omTooltip({trackMouse: false}); 
             */
            trackMouse : false,
            /**
             * ��ʾ��ʾ��Ĵ�����ʽ,��ѡֵ��mouseover��click 
             * @type String 
             * @default 'mouseover' 
             * @example
             * $("#tip").omTooltip({showOn: click}); 
             */
            showOn : "mouseover",
            /**
             * ajax��ʽ��ʾ���ݵ�ʱ���Ƿ��ӳټ���ҳ�棬����������url����Ч 
             * @type Boolean 
             * @default false 
             * @example
             * $("#tip").omTooltip({url:'a.html',lazyLoad: true}); 
             */
            lazyLoad : false,
            /**
             * ajax�������ݵ�url��ַ,���ص����ݸ�ʽdataTypeΪhtml
             * @type String 
             * @default null 
             * @example
             * $("#tip").omTooltip({url:'a.html'}); 
             */
            url : null,
            /**
             * ��ʾ����ʾ��ָ��λ�õ�ƫ���,��ʾ�������ֻ�׼λ�ã�һ����꣬����Ŀ������,
             *  ��һ������Ϊtopƫ��ֵ���ڶ���Ϊleftƫ��ֵ��
             * @type Object 
             * @default [5,5] 
             * @example
             * $("#tip").omTooltip({offset:[10,15]}); 
             */
            offset : [5,5],
            /**
             * anchorƫ�ƶ�(px),
             * ������anchorΪtop��button��ʱ��ƫ�ƶ�ָ���������ߵľ��룻
             * Ϊleft��right��ʱ��ƫ�ƶ�ָ��������ϵľ���
             * @type Number
             * @default 0
             * @example
             * $("#tip").omTooltip({anchorOffset:10}); 
             */
            anchorOffset : 0,
            /**
             * ��ʾ����ʾ������,������ʾ����ʾ��������������ã�
             * �������ĵ�ǰλ��Ϊ��׼����ʾ����������ƶ���
             * �������������Ŀ��Ϊ��׼����ʾ,��ѡֵ��left��right��top��bottom��
             * ����ѡ����left������ʾ����Զ������Ŀ�����ߣ��������Ŀ�ꡣ
             * @type String
             * @default null
             * @example
             * $("#tip").omTooltip({region:'bottom'}); 
             */
            region : null,
            /**
             * ��ʾ�����ʾ�����ݣ�������html����ͨ�ַ�,���ȼ���contentEL���Ըߡ�
             * @type String
             * @default null
             * @example
             * $("#tip").omTooltip({html:'&lt;span style="color:red;"&gt;����omTooltip&lt;/span&gt;'}); 
             */
            html : null,
            /**
             * jqueryѡ���������Ի�ȡҳ���domԪ����Ϊ��ʾ���ݣ���ʽΪ#ID��.className��tagName�ȣ����ȼ���html���Ե͡�
             * @type selector
             * @default null
             * @example
             * $("#tip").omTooltip({contentEL:'#aa'}); 
             */
            contentEL : null
            
        },
        _create:function(){
            this.tipContent = $('<div class="tip-body"></div>');
            this.tipAnchor = $('<div class="tip-anchor"></div>');
            this.regionMap = {'right':'left','top':'bottom','left':'right','bottom':'top'};
            this.tip = $('<div class="tip"></div>').append(this.tipContent);
        },
        /**
         * ��ʼ����������Ҫ���ø߿���������
         */
        _init:function(){
            var self = this , options = self.options;
            
            this.tipContent.empty();
            this.tip.find('div.tip-anchor').remove();
            
            if(options.anchor){
                self.tip.append(self.tipAnchor);
            }
            self.adjustWidth = 6 ; //����߿�
            self.adjustHeight =  6 ;
            if(options.width != 'auto'){
                this.tip.css('width',options.width-self.adjustWidth);
            }else{
                this.tip.css('width','auto');
            }
            if(options.height != 'auto'){
                this.tip.css('height',options.height - self.adjustHeight);
            }else{
                this.tip.css('height','auto');
            }
            if(options.minWidth) {
                this.tip.css('minWidth',options.minWidth - self.adjustWidth);
            }
            if(options.maxWidth){
                this.tip.css('maxWidth',options.maxWidth - self.adjustWidth);
            }
            if(options.maxHeight){
                this.tip.css('maxHeight',options.maxHeight - self.adjustHeight);
            }
            if(options.minHeight){
                this.tip.css('minHeight',options.minHeight - self.adjustHeight);
            }
            /**
             * ���ݼ��ص����ȼ�Ϊurl��html��contentEl��ǰ�߻Ḳ�Ǻ���
             */
            if(options.url && !options.lazyLoad){ //�����ajax��ʽ���Ҳ���������ģʽ���棬��ʼ�������ʱ�����������
                self._ajaxLoad(options.url);
            }else if(options.html){
                this.tip.find('.tip-body').append(options.html);
            }else{
                this.tip.find('.tip-body').append($(options.contentEL).html());
            }
            this._bindEvent();
        },
        /**
         * ajax�����첽�������ݣ����ص����ݸ�ʽΪhtml��
         * @param url
         */
        _ajaxLoad:function(url){
            var self = this;
            $.ajax({
                url: url,
                method: 'POST',
                dataType: 'html',
                success: function(data, textStatus){
                    self.tip.find('.tip-body').append(data);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    self.tip.find('.tip-body').append($.om.lang.omTooltip.FailedToLoad);
                }
            });
        },
        /**
         * ����ʾ����¼���ͬʱ�������õ�delay�������ӳ���ʾ���ӳ����ش���
         * ��������뿪��Ŀ�����򣬵��ǻ�ͣ������ʾ���ڵ�ʱ��������
         */
        _bindEvent : function(){
            var self = this , options = self.options , element = self.element;
            if(options.showOn == 'mouseover'){ //mouseover��ʱ����ʾ
                element.bind('mouseover',function(e){
                    if(self.showTime)clearTimeout(self.showTime); 
                    self.showTime = setTimeout(function(){
                        self.show(e);
                    },options.delay);
                });
            }else if(options.showOn == 'click'){ //click��ʱ����ʾ
                self.showTime = element.bind('click',function(e){
                    setTimeout(function(){
                        self.show(e);
                    },options.delay);
                });
            }
            if(options.trackMouse){
                element.bind('mousemove',function(e){
                    self._adjustPosition(e);
                });
            }
            element.bind('mouseleave',function(){
                if(self.showTime)clearTimeout(self.showTime); 
                self.hideTime = setTimeout(function(){ self.hide(); }, options.delay);
            });
            self.tip.bind('mouseover',function(){
                if(self.hideTime){clearTimeout(self.hideTime);}
            }).bind('mouseleave',function(){
                setTimeout(function(){ self.hide(); }, options.delay);
            });
        },
        /**
         * ��ʾ��������ֻ������ʾ��ʱ�����ӵ�dom����
         * �ڶ�����ʾ�Ѿ�����dom����ֻ��Ҫ�ı���ʾ״̬��
         * @name omTooltip#show
         * @function
         * @example
         * $('#mytip').omTooltip('show');
         */
        show : function(e){
            var self = this ,options = self.options;
            if($(document.body).find(self.tip).length <= 0){ //���û��д��dom���������
                if(options.url && options.lazyLoad){
                    self._ajaxLoad(options.url);
                }
                self.tip.appendTo(document.body).fadeIn();
                self._adjustPosition(e);
            }else{
                self._adjustPosition(e);
                self.tip.fadeIn();
            }
        },
        /**
         * ������ʾ���λ�ã����������event��trackMouseΪtrue��������event���������λ��
         * ��Ϊ��ʾ��Ļ���λ�ã��ٸ������õ�offset�ȼ������յ���ʾ��λ��
         * ���û�д���event����trackMouseΪfalse������ʾ����Ŀ��λ��Ϊ����λ�ã��ٸ���offset
         * region�Ȳ������������������λ�á�
         * ��������������Ŀ�ȶ���ʾ�����������region������right����������ұ��Ѿ�û���㹻�Ŀռ�
         * ������ʾ����Ὣ��ʾ����ʾ����ߣ�region������bottom��ʱ��ͬ��
         * @param event
         */
        _adjustPosition : function(event){
            var self = this , options = self.options , 
            element = self.element , top ,left,
            offSet = $(element).offset();
           if(event && !options.region){
                top = event.pageY + options.offset[0]; 
                left = event.pageX + options.offset[1]; 
                //anchor��������ľ��룬ʹ���û����õ�ƫ�Ƽ�ȥtip�ĸ߶Ⱥ͵��ڸ߶�
                self.tip.find('.tip-anchor').css({'top':options.anchorOffset+3,'left':'-9px'}).addClass('tip-anchor-left');
           }else{
               var bottomWidth = parseInt($(element).css('borderBottomWidth').replace('px',''));
               top = offSet.top +  $(element).height() + (isNaN(bottomWidth)?0:bottomWidth) +options.offset[0]; //1px��Ϊ���ھ���
               left = offSet.left +options.offset[1];
               //-----------����region������ʾ�̶�λ��--------------
               if(options.region == 'right'){ //offset������ƫ right��ΪĬ������
                   left = offSet.left + options.offset[1] + $(element).width() + self.adjustWidth; //Ԫ�ص�offset�����ƶ�$(element).widht()�ľ���
                   top = top - self.element.height() + self.adjustHeight + options.offset[0]; 
                   self.tip.find('.tip-anchor').css({'top':options.anchorOffset+3,'left':'-9px'}); //Ҫ��ȥ����ĸ߶�,ȥ��3px��radius
               }else if(options.region == 'left'){ //offset������ƫ
                   left = offSet.left - self.tip.width() - self.adjustWidth - options.offset[1] - 2; //����Ļ���Ҫ��ȥtip����Ŀ��
                   top = top - self.element.height() - self.adjustHeight - options.offset[0];
                   self.tip.find('.tip-anchor').css({'top':options.anchorOffset+3,'left': self.tip.outerWidth()-2}); //��anchor�����ƶ�tip�Ŀ��
               }else if(options.region == 'top'){ //offset������ƫ
                   top = top - (self.element.height() + self.tip.height() + self.adjustHeight + 2) - options.offset[0];
                   left = left + options.offset[1];
                   self.tip.find('.tip-anchor').css({'top':self.tip.outerHeight()-3, 'left':options.anchorOffset+3}); //25+4
               }else if(options.region == 'bottom'){ //offset������ƫ
                   top = top + options.offset[0];
                   left = left + options.offset[1];
                   self.tip.find('.tip-anchor').css({'top': -9, 'left':options.anchorOffset + 3});
               }
               self.tip.find('.tip-anchor').addClass('tip-anchor-'+self.regionMap[options.region]);
           }
           if((left + self.tip.width()) > document.documentElement.clientWidth){ //���ұ߾�����̵�ʱ��Ὣ��ʾ����������
               left = left - self.tip.width() - 20;
           }
           if((top + self.tip.height()) > document.documentElement.clientHeight){ //���±߾�����̵�ʱ��Ὣ��ʾ��������ϱ�
               top = top - (self.element.height() + self.tip.height()) - 20;
           }
           self.tip.css({'top':top - $(document).scrollTop(),'left':left - $(document).scrollLeft()});
        },
        /**
         * ���������
         * @name omTooltip#hide
         * @function
         * @example
         * $('#mytip').omTooltip('hide');
         */
        hide : function(){
            this.tip.hide();
        },
        destroy : function(){
        	clearTimeout(this.showTime);
        	clearTimeout(this.hideTime);
        	this.tip.remove();
        }
    });
    $.om.lang.omTooltip = {
            FailedToLoad : '������ʾ��Ϣ����'
    };
})(jQuery);
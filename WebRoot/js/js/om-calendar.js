/*
 * $Id: om-calendar.js,v 1.105 2012/05/08 07:28:27 linxiaomin Exp $
 * operamasks-ui omCalendar 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 */
/**
 * @name omCalendar
 * @param p ��׼config���� {minDate : new Date(2011, 7, 5), maxDate : new Date(2011, 7, 15)}
 * @class �����ؼ���Ĭ��ͨ����һ��������������չʾ��ͬʱҲ����ֱ����ʾ��ҳ���ϡ�<br /> 
 * �����ؼ��ṩ��һϵ������������ͳ��õ����api���������ǵ����ֲ�ͬ��Ӧ�ó�������ע�⣬�˿ؼ�֧�ֵ���ݴ�100��10000��<br /><br/>
 * <b>���߷���:</b>
 * <pre>$.omCalendar.formatDate(date, formatter)</pre>
 * <p>����������ڶ���date����formatter��ʽ����һ��string������.</p>
 * <pre>$.omCalendar.parseDate(date_string, formatter)</pre>
 * <p>�����string��ѭformatter��ʽ,��ʱ��ȡ������Ϣ,�������������ڶ���.</p>
 * <p>��������������һ����ʽ�ַ�������formater�������������"yy-m-d H:i"��<br />
 * �ڸ��ַ�����ÿ����ĸ(�� yy , m �ȵ�)�����ϸ�Ķ��壬������ʾ��<br /></p>
 * <b>���ڸ�ʽ����:</b>
 * <pre>
 * y:   ���(ȡ����2λ�ַ�),<br />
 * yy:  ���(��4λ�ַ���ʾ),<br />
 * m:   �·�(���ֱ�ʾ,����1���ַ���ʾ),<br />
 * mm:  �·�(���ֱ�ʾ,����2���ַ���ʾ,����ʱ��ǰ�����0),<br />
 * d:   ����(����1���ַ���ʾ),<br />
 * dd:  ����(����2���ַ���ʾ,����ʱ��ǰ�����0),<br />
 * h:   Сʱ(12Сʱ��,����2���ַ���ʾ,����ʱ��ǰ�����0,ȡֵ��Χ00~11),<br />
 * H:   Сʱ(24Сʱ��,����2���ַ���ʾ,����ʱ��ǰ�����0,ȡֵ��Χ00~23),<br />
 * g:   Сʱ(12Сʱ��,����1���ַ���ʾ,ȡֵ��Χ0~11),<br />
 * G:   Сʱ(24Сʱ��,����1���ַ���ʾ,ȡֵ��Χ0~23),<br />
 * i:   ����(����2���ַ���ʾ,ȡֵ��Χ00~59),<br />
 * s:   ����(����2���ַ���ʾ,ȡֵ��Χ00~59),<br />
 * u:   ����(����3���ַ���ʾ,ȡֵ��Χ000~999),<br />
 * D:   ���ڵļ�д(�� Sun, Sat�ȵ�),<br />
 * DD:  ���ڵ�ȫ��(�� Sunday, Saturday�ȵ�),<br />
 * M:   �·ݵļ�д(�� Jan, Feb �ȵ�),<br />
 * MM:  �·ݵ�ȫ��(�� January, February��),<br />
 * a:   ��������(Сд am & pm),<br />
 * A:   ��������(��д AM & PM),<br />
 * </pre>
 */
;(function($) {
    
    $.omWidget("om.omCalendar", {
        options : {
            /**
             * Ĭ����ʾ���ڡ�
             * @name omCalendar#date
             * @type Date
             * @default ��ǰ����
             * @example 
             *   $("#input").omCalendar({date : new Date(2012, 0, 1)});
             */
            date:        new Date(),
            
            /**
             * �������е�һ�������ڼ���Ĭ����ʼ�����������죩��ֵΪ0-6�����֣��ֱ���������쵽��������
             * @name omCalendar#startDay
             * @type Number
             * @default 0
             * @example
             *   $("#input").omCalendar({startDay : 1});
             */
            startDay:    0,
            
            /**
             * ��������һ����ʾ�����¡�Ĭ��ֻ��ʾһ���¡�
             * @name omCalendar#pages
             * @type Number
             * @default 1
             * @example
             *   $("#input").omCalendar({pages : 3});
             */
            pages:       1,
            
            /**
             * ��С���ڡ�С��������ڵ����ڽ���ֹѡ��
             * @name omCalendar#minDate
             * @type Date
             * @default ��
             * @example
             *   $("#input").omCalendar({minDate : new Date(2010, 0, 1)});
             */
            minDate:  false,
            
            /**
             * ������ڡ�����������ڵ����ڽ���ֹѡ��
             * @name omCalendar#maxDate
             * @type Date
             * @default ��
             * @example
             *   $("#input").omCalendar({maxDate : new Date(2010, 0, 1)});
             */
            maxDate:    false,
            
            /**
             * �Ƿ����input�����falseʱ�����򽫲�����Ҫͨ�������õ�������������ʾ������������ֱ����ʾ��ҳ���ϡ�
             * @name omCalendar#popup
             * @type Boolean
             * @default true
             * @example
             *   <div id="container" />
             *   $("#container").omCalendar({popup : false});
             */
            popup:       true,
            
            /**
             * �Ƿ���ʾʱ�䡣Ĭ�������ֻ��ʾ���ڲ���ʾʱ�䡣
             * @name omCalendar#showTime
             * @type Boolean
             * @default false
             * @example
             *   $("#input").omCalendar({showTime : true});
             */
            showTime:    false,
            
            /**
             * ѡ�����ں󴥷���
             * @event
             * @name omCalendar#onSelect
             * @type Function
             * @default emptyFn
             * @param date ѡ�е�����
             * @param event jQuery.Event����
             * @example
             *   $("#input").omCalendar({onSelect : function(date,event) {alert(date);}});
             */
            onSelect:    function(date,event) {}, 
            
            /**
             * ����ѡ�����ڡ��������ͣ������Ԫ��Ϊ 0-6���ֱ���������쵽��������
             * @name omCalendar#disabledDays
             * @type Array[Number]
             * @default []
             * @example
             *   ������������������Ϊ������:
             *     $("#input").omCalendar({disabledDays : [0, 6]});
             */
            disabledDays : [], 
            
            /**
             * ���ù��˲���ѡ���ڷ�����
             * @name omCalendar#disabledFn
             * @type Function
             * @default ��
             * @param δ�����˵�����
             * @example 
             * ���ڵ���10�ŵ����ڲ�����
             * $("#input").omCalendar({
             *     disabledFn : function disFn(date) {
             *         var nowMiddle = new Date();
             *         nowMiddle.setDate(10);
             *         if (date > nowMiddle) {
             *             return false;
             *         }
             *     }
             * });
             */
            disabledFn : function(d) {}, 
            
            /**
             * �Ƿ���������
             * @name omCalendar#disabled
             * @type Boolean
             * @default false
             * @example
             * $("#input").omCalendar({disabled : false});
             */
            disabled : false,
            
            /**
             * ����Ƿ�ֻ����
             * @name omCalendar#readOnly
             * @type Boolean
             * @default false
             * @example
             * $("#input").omCalendar({readOnly : false});
             */
            readOnly : false,
            
            /**
             * ����Ƿ�ɱ༭��������false��ֻ����ͨ��������ѡ�����ڣ����������������ֱ���������ڡ�
             * @name omCalendar#editable
             * @type Boolean
             * @default false
             * @example
             * $("#input").omCalendar({editable : true});
             */
            editable : true,
            
            /**
             * ���ڸ�ʽ������������ڸ�ʽ��������ο�Ԥ��ҳǩ���������showtime:false��Ĭ��ȡֵΪ 'yy-mm-dd'������Ϊ 'yy-mm-dd H:i:s'��
             * @name omCalendar#dateFormat
             * @type String
             * @default 'yy-mm-dd H:i:s'
             * @example
             * $("#input").omCalendar({dateFormat : 'yy-mm-dd'});
             */
            dateFormat : false
        },
        
        /**
         * ���ؼ�����Ϊ�����á��Ὣinput����Ϊ�����á�
         * @name omCalendar#disable
         * @function
         * @returns jQuery����
         * @example
         * $('#input').omCalendar('disable');
         */
        disable : function() {
            if (this.options.popup) {
                this.hide();
                this.options.disabled = true;
                this.element.attr("disabled", true)
                    .unbind('.omCalendar')
                    .next().addClass('om-state-disabled').unbind();
            }
        }, 
        
        /**
         * ���ؼ�����Ϊ����״̬���Ὣinput����Ϊ����״̬��
         * @name omCalendar#enable
         * @function
         * @returns jQuery����
         * @example
         * $('#input').omCalendar('enable');
         */
        enable : function() {
            if (this.options.popup) {
                this.options.disabled = false;
                this.element.attr("disabled", false)
                    .next().removeClass('om-state-disabled');
                this._buildStatusEvent();
            }
        },
        
        /**
         * ��ȡ�ؼ�ѡ�е����ڡ�
         * @name omCalendar#getDate
         * @function
         * @returns Date
         * @example
         * var date = $('#input').omCalendar('getDate');
         */
        getDate : function(){
                return this.options.date;
        }, 
       
        /**
         * ���ÿؼ�ѡ�е����ڡ�
         * @name omCalendar#setDate
         * @function
         * @param Date
         * @returns jQuery ����
         * @example
         * $('#input').omCalendar('setDate', new Date(2012, 0, 1));
         */
        setDate : function(d) {
            this.options.date = d;
            this._render({date : d});
        },
        
        _create : function() {
            var $self = this.element, opts = this.options;
                this.cid = this._stamp($self);
            
            if (opts.popup) {
                $self.wrap('<span></span>').after('<span class="om-calendar-trigger"></span>')
                    .parent().addClass("om-calendar om-widget om-state-default");
                
                this.con = $('<div></div>').appendTo(document.body).css({
                        'top':'0px',
                        'position':'absolute',
                        'background':'white',
                        'visibility':'hidden',
                        'z-index':'2000'});
                this._buildBodyEvent();
                this._buildStatusEvent();
            } else {
                this.con = this.element;
            }
            
            this.con.addClass('om-calendar-list-wrapper om-widget om-clearfix om-widget-content');
        },
        
        _init : function() {
            var $ele = this.element,
                opts = this.options;
            this.con.addClass('multi-' + opts.pages);
            this._buildParam();
            if (opts.popup) {
                $ele.val() && (opts.date = $.omCalendar.parseDate($ele.val(), opts.dateFormat || this._defaultFormat) || new Date());
            }
            this._render();
            
            if (opts.readOnly || !opts.editable) {
                $ele.attr('readonly', 'readOnly').unbind();
            } else {
                $ele.removeAttr('readonly');
            }
            
            opts.disabled ? this.disable() :  this.enable();
        }, 
        
        _render : function(o) {
            var i = 0,
                _prev,_next,_oym,
                $self = this.element,
                opt = this.options;
            this.ca = [];
            this._parseParam(o);
            
            this.con.html('');

            for (i = 0,_oym = [this.year,this.month]; i < opt.pages; i++) {
                if (i === 0) {
                    _prev = true;
                } else {
                    _prev = false;
                    _oym = this._computeNextMonth(_oym);
                }
                _next = i == (opt.pages - 1);
                this.ca.push(new $.om.omCalendar.Page({
                    year:_oym[0],
                    month:_oym[1],
                    prevArrow:_prev,
                    nextArrow:_next,
                    showTime:self.showTime
                }, this));
                this.ca[i]._render();
            }
            if(opt.pages > 1){
                var calbox = $self.find(".om-cal-box");
                var array = [];
                $.each(calbox, function(i,n){
                    array.push($(n).css("height"));
                });
                array.sort();
                calbox.css("height",array[array.length-1]);
            }
        },
    

        /**
         * ���Ը���������id�ı��,������id�򷵻�
         * @method _stamp
         * @param { JQuery-Node }
         * @return { string }
         * @private
         */
        _stamp: function($el){
            if($el.attr('id') === undefined || $el.attr('id')===''){
                $el.attr('id','K_'+ new Date().getTime());
            }
            return $el.attr('id');
        },

        _buildStatusEvent : function() {
            var self = this;
            this.element.unbind('.omCalendar').bind('click.omCalendar', this.globalEvent=function(e) {
                e.preventDefault();
                self.toggle();
            }).bind('focus.omCalendar', function(){
                $(this).parent().addClass('om-state-hover om-state-active');
            }).bind('blur.omCalendar', function(){
                $(this).parent().removeClass('om-state-hover om-state-active');
            }).next().unbind().click(function() {             // icon trigger
                self.element.trigger('focus');
                self.show();
            }).mouseover(function() {
                $(this).parent().addClass('om-state-hover');
            }).mouseout(function() {
                !self.isVisible() && $(this).parent().removeClass('om-state-hover');
            });
        },
        
        _buildBodyEvent: function() {
            var opts = this.options,
                $ele = this.element, 
                self = this;
            $('body').bind('mousedown.omCalendar', function(e) {
                var $source = $(e.target);
                //�����������
                if ($source.attr('id') === self.cid){
                    return;
                }
                if (($source.hasClass('om-next') || $source.hasClass('om-prev')) && 
                    $source[0].nodeName.toLowerCase() === 'a'){
                    return;
                }
                //�������ѡ������
                if ($.contains(self.con[0], $source[0]) &&
                        ($source[0].nodeName.toLowerCase() === 'option' ||
                                $source[0].nodeName.toLowerCase() === 'select')) {
                        return;
                } 
                
                //�����trigger��
                if ($source.attr('id') == self.cid || $source.siblings().attr('id') == self.cid){
                    return;
                }

                if($ele.css('visibility') == 'hidden') return ;
                var inRegion = function(dot,r){
                    if(dot[0]> r[0].x && dot[0]<r[1].x && dot[1] > r[0].y && dot[1] < r[1].y){
                        return true;
                    }else{
                        return false;
                    }
                };

                if(!inRegion([e.pageX,e.pageY],[
                                {
                                    x:self.con.offset().left,
                                    y:self.con.offset().top
                                },
                                {
                                    x:self.con.offset().left + self.con.width(),
                                    y:self.con.offset().top + self.con.height()
                                }])){
                    self.hide();
                }
            });
        },

        /**
         * �ı������Ƿ���ʾ��״̬
         * @mathod toggle
         */
        toggle: function() {
            if (!this.isVisible()) {
                this.show();
            } else {
                this.hide();
            }
        },
        
        isVisible : function() {
            if (this.con.css('visibility') == 'hidden') {
                return false;
            } 
            return true;
        },

        /**
         * ��ʾ����
         * @method show
         */
        show: function() {
            var $container = this.element.parent();
            this.con.css('visibility', '');
            var _x = $container.offset().left,
                height = $container.offsetHeight || $container.outerHeight(),
                _y = $container.offset().top + height;
            this.con.css('left', _x.toString() + 'px');
            this.con.css('top', _y.toString() + 'px');
        },

        /**
         * ��������
         * @method hide
         */
        hide: function() {
            this.con.css('visibility', 'hidden');
        },

		destroy : function() {
        	var $self = this.element;
        	$('body').unbind('.omCalendar' , this.globalEvent);
        	if(this.options.popup){
        		$self.parent().after($self).remove();
        		this.con.remove();
        	}
        },
        
        /**
         * ���������б�
         * @method _buildParam
         * @private
         */
        _buildParam: function() {
            var opts = this.options;
            opts.startDay && (opts.startDay = (7 - opts.startDay) % 7);
            !opts.dateFormat &&  (this._defaultFormat = opts.showTime ?  "yy-mm-dd H:i:s" : "yy-mm-dd"); 
            this.EV = [];
            return this;
        },

        /**
         * ���˲����б�
         * @method _parseParam
         * @private
         */
        _parseParam: function(o) {
            o && $.extend(this.options, o);
            this._handleDate();
        },

        /**
         * ģ�庯��
         * @method _templetShow
         * @private
         */
        _templetShow: function(templet, data) {
            var str_in,value_s,i,m,value,par;
            if (data instanceof Array) {
                str_in = '';
                for (i = 0; i < data.length; i++) {
                    str_in += arguments.callee(templet, data[i]);
                }
                templet = str_in;
            } else {
                value_s = templet.match(/{\$(.*?)}/g);
                if (data !== undefined && value_s !== null) {
                    for (i = 0,m = value_s.length; i < m; i++) {
                        par = value_s[i].replace(/({\$)|}/g, '');
                        value = (data[par] !== undefined) ? data[par] : '';
                        templet = templet.replace(value_s[i], value);
                    }
                }
            }
            return templet;
        },

        /**
         * ��������
         * @method _handleDate
         * @private
         */
        _handleDate: function() {
            var date = this.options.date;
            this.day = date.getDate();//����
            this.month = date.getMonth();//�·�
            this.year = date.getFullYear();//���
        },

        //get����
        _getHeadStr: function(year, month) {
            return year.toString() + $.om.lang.omCalendar.year + (Number(month) + 1).toString() + $.om.lang.omCalendar.month;
        },

        //�¼�
        _monthAdd: function() {
            var self = this;
            if (self.month == 11) {
                self.year++;
                self.month = 0;
            } else {
                self.month++;
            }
            self.options.date.setFullYear(self.year, self.month);
            return this;
        },

        //�¼�
        _monthMinus: function() {
            var self = this;
            if (self.month === 0) {
                self.year--;
                self.month = 11;
            } else {
                self.month--;
            }
            self.options.date.setFullYear(self.year, self.month);
            return this;
        },

        //������һ���µ�����,[2009,11],��:fullYear����:��0��ʼ����
        _computeNextMonth: function(a) {
            var _year = a[0],
                _month = a[1];
            if (_month == 11) {
                _year++;
                _month = 0;
            } else {
                _month++;
            }
            return [_year,_month];
        },

        //�������ڵ�ƫ����
        _handleOffset: function() {
            var self = this,
                i18n = $.om.lang.omCalendar,
                data = [i18n.Su, i18n.Mo, i18n.Tu, i18n.We, i18n.Th, i18n.Fr, i18n.Sa],
                temp = '<span>{$day}</span>',
                offset = this.options.startDay,
                day_html = '',
                a = [];
            for (var i = 0; i < 7; i++) {
                a[i] = {
                    day:data[(i - offset + 7) % 7]
                };
            }
            day_html = self._templetShow(temp, a);

            return {
                day_html:day_html
            };
        }
    });
	
	$.extend($.om.omCalendar, {
		Page: function(config, father) {
		    var i18n = $.om.lang.omCalendar;
            //����
            this.father = father;
            this.month = Number(config.month);
            this.year = Number(config.year);
            this.prevArrow = config.prevArrow;
            this.nextArrow = config.nextArrow;
            this.node = null;
            this.timmer = null;//ʱ��ѡ���ʵ��
            this.id = '';
            this.EV = [];
            this.html = [
                '<div class="om-cal-box" id="{$id}">',
                '<div class="om-cal-hd om-widget-header">',
                '<a href="javascript:void(0);" class="om-prev {$prev}"><span class="om-icon om-icon-seek-prev">Prev</span></a>',
                '<a href="javascript:void(0);" class="om-title">{$title}</a>',
                '<a href="javascript:void(0);" class="om-next {$next}"><span class="om-icon om-icon-seek-next">Next</span></a>',
                '</div>',
                '<div class="om-cal-bd">',
                '<div class="om-whd">',
                /*
                 '<span>��</span>',
                 '<span>һ</span>',
                 '<span>��</span>',
                 '<span>��</span>',
                 '<span>��</span>',
                 '<span>��</span>',
                 '<span>��</span>',
                 */
                father._handleOffset().day_html,
                '</div>',
                '<div class="om-dbd om-clearfix">',
                '{$ds}',
                /*
                 <a href="" class="om-null">1</a>
                 <a href="" class="om-state-disabled">3</a>
                 <a href="" class="om-selected">1</a>
                 <a href="" class="om-today">1</a>
                 <a href="">1</a>
                 */
                '</div>',
                '</div>',
                '<div class="om-setime om-state-default hidden">',
                '</div>',
                '<div class="om-cal-ft {$showtime}">',
                '<div class="om-cal-time om-state-default">',
                'ʱ�䣺00:00 &hearts;',
                '</div>',
                '</div>',
                '<div class="om-selectime om-state-default hidden">',//<!--���Դ�ŵ�ѡʱ���һЩ�ؼ�ֵ-->',
                '</div>',
                '</div><!--#om-cal-box-->'
            ].join("");
            this.nav_html = [
                '<p>',
                i18n.month,
                '<select value="{$the_month}">',
                '<option class="m1" value="1">01</option>',
                '<option class="m2" value="2">02</option>',
                '<option class="m3" value="3">03</option>',
                '<option class="m4" value="4">04</option>',
                '<option class="m5" value="5">05</option>',
                '<option class="m6" value="6">06</option>',
                '<option class="m7" value="7">07</option>',
                '<option class="m8" value="8">08</option>',
                '<option class="m9" value="9">09</option>',
                '<option class="m10" value="10">10</option>',
                '<option class="m11" value="11">11</option>',
                '<option class="m12" value="12">12</option>',
                '</select>',
                '</p>',
                '<p>',
                i18n.year,
                '<input type="text" value="{$the_year}" onfocus="this.select()"/>',
                '</p>',
                '<p>',
                '<button class="ok">',
                i18n.ok,
                '</button><button class="cancel">',
                i18n.cancel,
                '</button>',
                '</p>'
            ].join("");


            //����
            //���õ����ݸ�ʽ����֤
            this.Verify = function() {

                var isDay = function(n) {
                    if (!/^\d+$/i.test(n)){
						return false;
					}
                    n = Number(n);
                    return !(n < 1 || n > 31);

                },
                    isYear = function(n) {
                        if (!/^\d+$/i.test(n)){
							return false;
						}
                        n = Number(n);
                        return !(n < 100 || n > 10000);

                    },
                    isMonth = function(n) {
                        if (!/^\d+$/i.test(n)){
							return false;
						}
                        n = Number(n);
                        return !(n < 1 || n > 12);


                    };

                return {
                    isDay:isDay,
                    isYear:isYear,
                    isMonth:isMonth

                };

            };

            /**
             * ��Ⱦ��������UI
             */
            this._renderUI = function() {
                var cc = this,_o = {},ft,fOpts = cc.father.options;
                cc.HTML = '';
                _o.prev = '';
                _o.next = '';
                _o.title = '';
                _o.ds = '';
                if (!cc.prevArrow) {
                    _o.prev = 'hidden';
                }
                if (!cc.nextArrow) {
                    _o.next = 'hidden';
                }
                if (!cc.father.showTime) {
                    _o.showtime = 'hidden';
                }
                _o.id = cc.id = 'om-cal-' + Math.random().toString().replace(/.\./i, '');
                _o.title = cc.father._getHeadStr(cc.year, cc.month);
                cc.createDS();
                _o.ds = cc.ds;
                cc.father.con.append(cc.father._templetShow(cc.html, _o));
                cc.node = $('#' + cc.id);
                if (fOpts.showTime) {
                    ft = cc.node.find('.om-cal-ft');
                    ft.removeClass('hidden');
                    cc.timmer = new $.om.omCalendar.TimeSelector(ft, cc.father);
                }
                return this;
            };
            /**
             * �������������¼�
             */
            this._buildEvent = function() {
                var cc = this,i,
                    con = $('#' + cc.id), 
                    fOpts = cc.father.options;

                cc.EV[0] = con.find('div.om-dbd').bind('click', function(e) {
                    //e.preventDefault();
                    var $source = $(e.target);
                    if ($source.filter('.om-null, .om-state-disabled').length > 0){
						return;
					}
                    var selected = Number($source.html());
					//���������30�ջ���31�գ�����2�·ݾͻ������
                    var d = new Date(fOpts.date);
                    d.setFullYear(cc.year, cc.month, selected);
                    cc.father.dt_date = d;
                    
                    if (!fOpts.showTime) {
                    	cc.father._trigger("onSelect",e,d);
                    }
                    
                    if (fOpts.popup && !fOpts.showTime) {
                        cc.father.hide();
                        if(!isNaN(cc.father.dt_date)){  //���ie7�϶�������Ȼ��������⣬���������������Ի���
                            var dateStr = $.omCalendar.formatDate(cc.father.dt_date, fOpts.dateFormat || cc.father._defaultFormat);
                            $(cc.father.element).val(dateStr);
                        }
                    }
                    cc.father._render({date:d});
                }).find('a').bind('mouseover',function(e){
                    $(this).addClass('om-state-hover om-state-nobd');
                }).bind('mouseout',function(e){
                    $(this).removeClass('om-state-hover')
                        .not('.om-state-highlight, .om-state-active')
                        .removeClass('om-state-nobd');
                });
                //��ǰ
                cc.EV[1] = con.find('a.om-prev').bind('click', function(e) {
                    e.preventDefault();
                    cc.father._monthMinus()._render();
                });
                //���
                cc.EV[2] = con.find('a.om-next').bind('click', function(e) {
                    e.preventDefault();
                    cc.father._monthAdd()._render();
                });
                cc.EV[3] = con.find('a.om-title').bind('click', function(e) {
                    try {
                        cc.timmer.hidePopup();
                        e.preventDefault();
                    } catch(exp) {
                    }
                    var $source = $(e.target);
                    var in_str = cc.father._templetShow(cc.nav_html, {
                        the_month:cc.month + 1,
                        the_year:cc.year
                    });
                    con.find('.om-setime').html(in_str)
	                    .removeClass('hidden')
                        .find("option:[value=" + (cc.month + 1) + "]").attr("selected", "selected");
                    this.blur();   
                    con.find('input').bind('keydown', function(e) {
                        var $source = $(e.target);
                        if (e.keyCode == $.om.keyCode.UP) {
                            $source.val(Number($source.val()) + 1);
                            $source[0].select();
                        }
                        if (e.keyCode == $.om.keyCode.DOWN) {
                            $source.val(Number($source.val()) - 1);
                            $source[0].select();
                        }
                        if (e.keyCode == $.om.keyCode.ENTER) {
                            var _month = con.find('.om-setime select').val();
                            var _year = con.find('.om-setime input').val();
                            con.find('.om-setime').addClass('hidden');
                            if (!cc.Verify().isYear(_year)){
								return;
							}
                            if (!cc.Verify().isMonth(_month)){
								return;
							}
                            cc.father._render({
                                date : cc._computeDate(cc, _year, _month)
                            });
                        }
                    });
                }).bind("mouseover", function(e){
                    $(this).addClass("om-state-hover");
                }).bind("mouseout", function(e){
                    $(this).removeClass("om-state-hover");
                });
                cc.EV[4] = con.find('.om-setime').bind('click', function(e) {
                    e.preventDefault();
                    var $source = $(e.target),
                        $this = $(this);
                    if ($source.hasClass('ok')) {
                        var _month = $this.find('select').val(),
                            _year = $this.find('input').val();
                        $this.addClass('hidden');
                        if (!cc.Verify().isYear(_year)){
							return;
						}
                        if (!cc.Verify().isMonth(_month)){
							return;
						}
                        _month = _month - $this.parent().prevAll('.om-cal-box').length - 1;
                        cc.father._render({
                            date: cc._computeDate(cc, _year, _month)
                        });
                    } else if ($source.hasClass('cancel')) {
                        $this.addClass('hidden');
                    }
                });
            };
            
            this._computeDate = function(cc, year, month) {
                var result = new Date(cc.father.options.date.getTime());
                result.setFullYear(year, month);
                return result;
            };
            
            /**
             * �õ���ǰ��������node����
             */
            this._getNode = function() {
                var cc = this;
                return cc.node;
            };
            /**
             * �õ�ĳ���ж�����,��Ҫ���������ж�����
             */
            this._getNumOfDays = function(year, month) {
                return 32 - new Date(year, month - 1, 32).getDate();
            };
            /**
             * �������ڵ�html
             */
            this.createDS = function() {
                var cc = this,
                    fOpts = cc.father.options,
                    s = '',
                    startweekday = (new Date(cc.year + '/' + (cc.month + 1) + '/01').getDay() + fOpts.startDay + 7) % 7,//���µ�һ�������ڼ�
                    k = cc._getNumOfDays(cc.year, cc.month + 1) + startweekday,
                    i, _td_s;
                
                
                var _dis_days = [];
                for (i = 0; i < fOpts.disabledDays.length; i++) {
                    _dis_days[i] = fOpts.disabledDays[i] % 7;
                }

                for (i = 0; i < k; i++) {
                    var _td_e = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 1 - startweekday).toString());
                    if (i < startweekday) {//null
                        s += '<a href="javascript:void(0);" class="om-null" >0</a>';
                    } else if ($.inArray((i + fOpts.startDay) % 7, _dis_days) >= 0) {
                        s += '<a href="javascript:void(0);" class="om-state-disabled">' + (i - startweekday + 1) + '</a>';
                    } else if (fOpts.disabledFn(_td_e) === false) {
                        s += '<a href="javascript:void(0);" class="om-state-disabled">' + (i - startweekday + 1) + '</a>';
                    } else if (fOpts.minDate instanceof Date &&
                        new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 1 - startweekday)).getTime() < (fOpts.minDate.getTime() + 1)) {//disabled
                        s += '<a href="javascript:void(0);" class="om-state-disabled">' + (i - startweekday + 1) + '</a>';

                    } else if (fOpts.maxDate instanceof Date &&
                        new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 1 - startweekday)).getTime() > fOpts.maxDate.getTime()) {//disabled
                        s += '<a href="javascript:void(0);" class="om-state-disabled">' + (i - startweekday + 1) + '</a>';
                    } else if (i == (startweekday + (new Date()).getDate() - 1) &&
                        (new Date()).getFullYear() == cc.year  &&
                        (new Date()).getMonth() == cc.month) {//today
                        s += '<a href="javascript:void(0);" class="om-state-highlight om-state-nobd">' + (i - startweekday + 1) + '</a>';

                    } else if (i == (startweekday + fOpts.date.getDate() - 1) &&
                        cc.month == fOpts.date.getMonth() &&
                        cc.year == fOpts.date.getFullYear()) {//selected
                        s += '<a href="javascript:void(0);" class="om-state-active om-state-nobd">' + (i - startweekday + 1) + '</a>';
                    } else {//other
                        s += '<a href="javascript:void(0);">' + (i - startweekday + 1) + '</a>';
                    }
                }
                if (k % 7 !== 0) {
                    for (i = 0; i < (7 - k % 7); i++) {
                        s += '<a href="javascript:void(0);" class="om-null">0</a>';
                    }
                }
                cc.ds = s;
            };
            /**
             * ��Ⱦ
             */
            this._render = function() {
                var cc = this;
                cc._renderUI();
                cc._buildEvent();
            };


        }//Page constructor over
    });
	
	$.extend($.om.omCalendar, {
        /**
         * ʱ��ѡ������
         * @constructor Calendar.TimerSelector
         * @param {object} ft ,timer���ڵ�����
         * @param {object} father ָ��Calendarʵ����ָ�룬��Ҫ������Ĳ���
         */
        TimeSelector:function(ft, father) {
            //����
            var date = father.options.date,
                i18n = $.om.lang.omCalendar;
            
            this.father = father;
            this.fcon = ft.parent('.om-cal-box');
            this.popupannel = this.fcon.find('.om-selectime');//��ѡʱ��ĵ�����
            if (typeof date == 'undefined') {//ȷ����ʼֵ�͵�ǰʱ��һ��
                father.options.date = new Date();
            }
            this.time = father.options.date;
            this.status = 's';//��ǰѡ���״̬��'h','m','s'�����жϸ����ĸ�ֵ
            this.ctime = $('<div class="om-cal-time om-state-default">' + i18n.time + '��<span class="h">h</span>:<span class="m">m</span>:<span class="s">s</span><!--{{arrow--><div class="cta"><button class="u om-icon om-icon-triangle-1-n"></button><button class="d om-icon om-icon-triangle-1-s"></button></div><!--arrow}}--></div>');
            this.button = $('<button class="ct-ok om-state-default">' + i18n.ok +'</button>');
            //Сʱ
            this.h_a = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
            //����
            this.m_a = ['00','10','20','30','40','50'];
            //��
            this.s_a = ['00','10','20','30','40','50'];


            //����
            /**
             * ������Ӧ������html��ֵ��������a��
             * ������Ҫƴװ������
             * ���أ�ƴ�õ�innerHTML,��β��Ҫ��һ���رյ�a
             *
             */
            this.parseSubHtml = function(a) {
                var in_str = '';
                for (var i = 0; i < a.length; i++) {
                    in_str += '<a href="javascript:void(0);" class="om-cal-item">' + a[i] + '</a>';
                }
                in_str += '<a href="javascript:void(0);" class="x">x</a>';
                return in_str;
            };
            /**
             * ��ʾom-selectime����
             * ����������õ�innerHTML
             */
            this.showPopup = function(instr) {
                var self = this;
                this.popupannel.html(instr);
                this.popupannel.removeClass('hidden');
                var status = self.status;
                var active_cls = "om-state-active om-state-nobd";
                self.ctime.find('span').removeClass(active_cls);
                switch (status) {
                    case 'h':
                        self.ctime.find('.h').addClass(active_cls);
                        break;
                    case 'm':
                        self.ctime.find('.m').addClass(active_cls);
                        break;
                    case 's':
                        self.ctime.find('.s').addClass(active_cls);
                        break;
                }
            };
            /**
             * ����om-selectime����
             */
            this.hidePopup = function() {
                this.popupannel.addClass('hidden');
            };
            /**
             * ������������������ļ��裬��������time��ʾ����
             */
            this._render = function() {
                var self = this;
                var h = self.get('h');
                var m = self.get('m');
                var s = self.get('s');
                self.father._time = self.time;
                self.ctime.find('.h').html(h);
                self.ctime.find('.m').html(m);
                self.ctime.find('.s').html(s);
                return self;
            };
            //�����set��get��ֻ�Ƕ�time�Ĳ��������������������������
            /**
             * set(status,v)
             * h:2,'2'
             */
            this.set = function(status, v) {
                var self = this;
                v = Number(v);
                switch (status) {
                    case 'h':
                        self.time.setHours(v);
                        break;
                    case 'm':
                        self.time.setMinutes(v);
                        break;
                    case 's':
                        self.time.setSeconds(v);
                        break;
                }
                self._render();
            };
            /**
             * get(status)
             */
            this.get = function(status) {
                var self = this;
                var time = self.time;
                switch (status) {
                    case 'h':
                        return time.getHours();
                    case 'm':
                        return time.getMinutes();
                    case 's':
                        return time.getSeconds();
                }
            };

            /**
             * add()
             * ״ֵ̬����ı�����1
             */
            this.add = function() {
                var self = this;
                var status = self.status;
                var v = self.get(status);
                v++;
                self.set(status, v);
            };
            /**
             * minus()
             * ״ֵ̬����ı�����1
             */
            this.minus = function() {
                var self = this;
                var status = self.status;
                var v = self.get(status);
                v--;
                self.set(status, v);
            };


            //����
            this._timeInit = function() {
                var self = this;
                ft.html('').append(self.ctime);
                ft.append(self.button);
                self._render();
				//TODO:
                self.popupannel.bind('click', function(e) {
                    var el = $(e.target);
                    if (el.hasClass('x')) {//�ر�
                        self.hidePopup();
                    } else if (el.hasClass('om-cal-item')) {//��ѡһ��ֵ
                        var v = Number(el.html());
                        self.set(self.status, v);
                        self.hidePopup();
                    }
                });
                //ȷ���Ķ���
                self.button.bind('click', function(e) {
                    //��ʼ����ȡ�����date
                    var fOpts = self.father.options;
                    var d = typeof self.father.dt_date == 'undefined' ? fOpts.date : self.father.dt_date;
                    d.setHours(self.get('h'));
                    d.setMinutes(self.get('m'));
                    d.setSeconds(self.get('s'));
                    self.father._trigger("onSelect",e,d);
                    if (fOpts.popup) {
                        var dateStr = $.omCalendar.formatDate(d, fOpts.dateFormat || self.father._defaultFormat);
                        $(self.father.element).val(dateStr);
                        self.father.hide();
                    }
                });
                //ctime�ϵļ����¼������¼������Ҽ��ļ���
                //TODO �����Ƿ�ȥ��
                self.ctime.bind('keyup', function(e) {
                    if (e.keyCode == $.om.keyCode.UP || e.keyCode == $.om.keyCode.LEFT) {//up or left
                        //e.stopPropagation();
                        e.preventDefault();
                        self.add();
                    }
                    if (e.keyCode == $.om.keyCode.DOWN || e.keyCode == $.om.keyCode.RIGHT) {//down or right
                        //e.stopPropagation();
                        e.preventDefault();
                        self.minus();
                    }
                });
                //�ϵļ�ͷ����
                self.ctime.find('.u').bind('click', function() {
                    self.hidePopup();
                    self.add();
                });
                //�µļ�ͷ����
                self.ctime.find('.d').bind('click', function() {
                    self.hidePopup();
                    self.minus();
                });
                //����ѡ��Сʱ
                self.ctime.find('.h').bind('click', function() {
                    var in_str = self.parseSubHtml(self.h_a);
                    self.status = 'h';
                    self.showPopup(in_str);
                });
                //����ѡ�����
                self.ctime.find('.m').bind('click', function() {
                    var in_str = self.parseSubHtml(self.m_a);
                    self.status = 'm';
                    self.showPopup(in_str);
                });
                //����ѡ����
                self.ctime.find('.s').bind('click', function() {
                    var in_str = self.parseSubHtml(self.s_a);
                    self.status = 's';
                    self.showPopup(in_str);
                });
            };
            this._timeInit();
        }

    });
	
	$.omCalendar = $.omCalendar || {};
	
	$.extend($.omCalendar, {
        leftPad : function (val, size, ch) {
            var result = new String(val);
            if(!ch) {
                ch = " ";
            }
            while (result.length < size) {
                result = ch + result;
            }
            return result.toString();
        }
    });
	$.extend($.omCalendar, {
	    getShortDayName : function(day){
            return $.omCalendar.dayMaps[day][0];
        },
        getDayName : function (day) { 
            return $.omCalendar.dayMaps[day][1];
        },
	    
        getShortMonthName : function(month){
            return $.omCalendar.monthMaps[month][0];
	    },
	    getMonthName : function (month) { 
	        return $.omCalendar.monthMaps[month][1];
	    },
	    dayMaps : [
            ['Sun', 'Sunday'],
	        ['Mon', 'Monday'],
	        ['Tue', 'Tuesday'],
	        ['Wed', 'Wednesday'],
	        ['Thu', 'Thursday'],
	        ['Fri', 'Friday'],
	        ['Sat', 'Saturday']
	    ],
	    monthMaps : [
            ['Jan', 'January'],
            ['Feb', 'February'],
            ['Mar', 'March'],
            ['Apr', 'April'],
            ['May', 'May'],
            ['Jun', 'June'],
            ['Jul', 'July'],
            ['Aug', 'August'],
            ['Sep', 'September'],
            ['Oct', 'October'],
            ['Nov', 'November'],
            ['Dec', 'December']
        ],
        /**
         * g: getter method
         * s: setter method
         * r: regExp
         */
        formatCodes : {
	        //date
	        d: {
	            g: "this.getDate()", //date of month (no leading zero)
	            s: "this.setDate({param})",
	            r: "(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])"
	        },
	        dd: {
	            g: "$.omCalendar.leftPad(this.getDate(), 2, '0')", //date of month (two digit)
	            s: "this.setDate(parseInt('{param}', 10))",
	            r: "(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])"
	        },
	         
	        //month
	        m: {
	            g: "(this.getMonth() + 1)", // get month in one digits, no leading zero
	            s: "this.setMonth(parseInt('{param}', 10))",
	            r: "(0[1-9]|1[0-2]|[1-9])"
	        },
	        mm: { 
	            g: "$.omCalendar.leftPad(this.getMonth() + 1, 2, '0')",//two digits
	            s: "this.setMonth(parseInt('{param}', 10))",
	            r: "(0[1-9]|1[0-2]|[1-9])"
	        },
	        
	        //year
	        y: {
	            g: "('' + this.getFullYear()).substring(2, 4)", // get year in 2 digits
	            s: "this.setFullYear(parseInt('20{param}', 10))",
	            r: "(\\d{2})"
	        },
	        yy: {
	            g: "this.getFullYear()", // get year in 4 digits
	            s: "this.setFullYear(parseInt('{param}', 10))",
	            r: "(\\d{4})"
	        },
	        
	        //hour
	        h: {
	            g: "$.omCalendar.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",// 12 hours, two digits
	            s: "this.setHours(parseInt('{param}', 10))", // TODO,need to be fixed
	            r: "(0[0-9]|1[0-1])" // 00~11
	        },
            H: {
                g: "$.omCalendar.leftPad(this.getHours(), 2, '0')",   //24 hours, two digits
                s: "this.setHours(parseInt('{param}', 10))",
                r: "([0-1][0-9]|2[0-3])"   //00~23
            },
            g: {
                g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)", // 12 hours, no leading 0
                s: "this.setHours(parseInt('{param}', 10))", // TODO,need to be fixed
                r: "([0-9]|1[0-1])" // 0, 1, 2, 3, ..., 11
            },
            G: {
                g: "this.getHours()",   // 24 hours, no leading 0
                s: "this.setHours(parseInt('{param}', 10))",
                r: "([0-9]|1[0-9]|2[0-3])" //0, 1, 2, 3, ..., 23
            },
            
            //minute
            i: {
                g: "$.omCalendar.leftPad(this.getMinutes(), 2, '0')", // get minute (two digits)
                s: "this.setMinutes(parseInt('{param}', 10))",
                r: "([0-5][0-9])" //00, 01, 02, ..., 59
            }, 
            
            //second
            s: {
                g: "$.omCalendar.leftPad(this.getSeconds(), 2, '0')", // get seconds (two digits)
                s: "this.setSeconds(parseInt('{param}', 10))",
                r: "([0-5][0-9])" //00, 01, 02, ..., 59
            },
            
            // millisecond
            u: {
                g: "$.omCalendar.leftPad(this.getMilliseconds(), 3, '0')",
                s: "this.setMilliseconds(parseInt('{param}', 10))",
                r: "(\\d{1,3})" //0, 1, 2, ..., 999
            },
            
            //localised names
            D: {
                g: "$.omCalendar.getShortDayName(this.getDay())", // get localised short day name
                s: "",
                r: ""
            },
            DD: {
                g: "$.omCalendar.getDayName(this.getDay())", // get localised long day name
                s: "",
                r: ""
            },
            
            M: {
                g: "$.omCalendar.getShortMonthName(this.getMonth())", // get localised short month name
                s: "",
                r: ""
            },
            MM: {
                g: "$.omCalendar.getMonthName(this.getMonth())", // get localised long month name
                s:"",
                r:""
            },
            
            //am & pm
            a: {
                g: "(this.getHours() < 12 ? 'am' : 'pm')", // am pm
                s: "",
                r: ""
            },
            A: {
                g: "(this.getHours() < 12 ? 'AM' : 'PM')", // AM PM
                s: "",
                r: ""
            }
        }
	});
	$.extend($.omCalendar, {
		
	    formatDate : function(date, formatter){
	        if (!date || !formatter) {
	            return null;
	        }
	        if (!(Object.prototype.toString.call(date) === '[object Date]')) {
	            return null;
	        }
	        var i, fi , result = '', literal = false;
	        for (i = 0; i < formatter.length ; i++ ) {
	            fi = formatter.charAt(i);
	            fi_next = formatter.charAt(i + 1);
	            if (fi == "'") {
	                literal = !literal;
	                continue;
	            }
	            if (!literal && $.omCalendar.formatCodes[fi + fi_next]) {
	                fi = new Function("return " + $.omCalendar.formatCodes[fi + fi_next].g).call(date);
	                i ++;
	            } else if (!literal && $.omCalendar.formatCodes[fi]) {
	                fi = new Function("return " + $.omCalendar.formatCodes[fi].g).call(date);
	            }
	            result += fi;
	        }
	        return result;
	        
	    },
	    parseDate : function(date_string, formatter){
	        if (!date_string || !formatter) {
	            return null;
	        }
	        if (!(Object.prototype.toString.call(date_string) === '[object String]')) {
	            return null;
	        }
	        var setterArr = [], i, fi, $fci = null, m_result;
	        for (i = 0 ; i < formatter.length; i ++) {
	            fi = formatter.charAt(i);
	            fi_next = formatter.charAt(i + 1);
	            if ($.omCalendar.formatCodes[fi + fi_next]) {
	                $fci = $.omCalendar.formatCodes[fi + fi_next];
                    i ++;
                } else if ($.omCalendar.formatCodes[fi]) {
                    $fci = $.omCalendar.formatCodes[fi];
                } else {
                    continue;
                }
	            m_result = date_string.match(new RegExp($fci.r));
	            if (!m_result) {
	                // your string and your formmatter is not matched!
	                return null;
	            }
	            setterArr.push($fci.s.replace('{param}', m_result[0]));
	            date_string = date_string.substring(m_result.index + m_result[0].length);
	            var newChar = formatter.charAt(i + 1);
	            if (!(newChar == "" && date_string == "") 
	                    && (newChar !== date_string.charAt(0))
	                    && ($.omCalendar.formatCodes[newChar] === undefined)) {
	                // your string and your formmatter is not matched!
                    return null;
                }
	        }
	        var date = new Date();
	        new Function(setterArr.join(";")).call(date);
            date.setMonth(date.getMonth() - 1);
	        return date;
	    }
	});
	
	$.om.lang.omCalendar = {
        year : '��',
        month : '��',
        Su : '��',
        Mo : 'һ',
        Tu : '��',
        We : '��',
        Th : '��',
        Fr : '��',
        Sa : '��',
        cancel : 'ȡ��',
        ok : 'ȷ��',
        time : 'ʱ��'
    };
})(jQuery);
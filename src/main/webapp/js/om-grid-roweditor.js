/*
 * $Id: om-grid-roweditor.js,v 1.17 2012/05/07 09:36:42 chentianzhen Exp $
 * operamasks-ui omGrid 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 * 
 * Depends:
 *  om-grid.js
 *  om-button.js
 */

(function($) {
	var own = Object.prototype.hasOwnProperty,
		self;
    $.omWidget.addInitListener('om.omGrid',function(){
    	self = this;
    	
    	var $elem = self.element,
    		options = self.options,
    		colModel = options.colModel,
    		$grid = $elem.closest('.om-grid'),
    		gridHeaderCols=$('.hDiv thead tr:first th', $grid),
    		editComp,//{name:{type:�������,model:�ж�Ӧmodel,instance:���ʵ��}}
    		lastValue;
    		
    	self._triggered = false;//�Ƿ��Ѿ�������һ�α༭�ˡ�
    	//��������ж����ɱ༭����ô_globalEditable=false,��ʱ������ԭ�����ж����ɱ༭���������ʱ������options.editMode=="insert",
    	//������ӽ������л��ǿ��Ա༭�ġ�
    	self._globalEditable = false;
    	
    	/**
    	 * <span style='color:red'>(�������б༭���)</span>�༭ģʽ��
    	 * ��ѡֵΪ"all","insert"��Ĭ��Ϊ"all"��"all"��ʾ�����ж��ǿɱ༭�ģ���������е��ж��ǲ��ɱ༭�ģ���ô�б༭�����Ȼ��ʧЧ��
    	 * ������������������е��ж��ǲ��ɱ༭�ģ����Ǵ˱����Զ�̬������У�������Щ�����ڳ־û�����̨֮ǰ�ǿ��Ա༭�ģ���ô��Ҫʹ��"insert"ģʽ�ˡ� 
    	 * @name omGrid#editMode
    	 * @type String
    	 * @default "all"
    	 * @example
    	 * $('.selector').omGrid({width : 600, editMode:"insert");
    	 */
    	options.editMode = options.editMode || "all";//Ĭ��Ϊallģʽ���������ж����Ա༭
    	self._allEditMode = options.editMode=="all";
    		
    	for(var i=0,len=colModel.length; i<len; i++){
    		self._globalEditable = colModel[i]["editor"]? true : false;
    		if(self._globalEditable){
    			break;
    		}
    	}
    	
    	if(!_isEditable()){
    		return ;//�������༭���ܣ��ò���κη�������ʧЧ��
    	}
		self._editComps = {};//����ÿһ�еı༭�����keyΪcolModel�е�name,valueΪ{model:ģ��,instance:���ʵ��,type:����}
		self._errorHolders = {};//  name:div   ÿ���༭��Ԫ���Ӧ�ĳ�����Ϣ����
		self._colWidthResize;//���grid�ɱ༭�����϶��������ı��п�ʱ����ǰ�������ڱ༭״̬�������ô�ֵΪtrue,��������ʾ�༭��ʱ�ɴ�����Ҫ���¼����������Ŀ��
		
		options._onRefreshCallbacks.push(_onRefresh);//ֻ������ˢ�º�ſ��Խ��г�ʼ��
		options._omResizableCallbacks.push(_onResizable);
		
        this.tbody.delegate('tr.om-grid-row','dblclick',editRenderer); 
        this.tbody.delegate('tr.om-grid-row','click',function(event){
        	if(self._triggered && self._editView.editing){
        		if(self._validator && self._validator.valid()){
        			editRenderer.call(this);
        		}else{
        			editRenderer.call(this);
        		}
        	}
        });
        
        var btnScrollTimer;
        $elem.parent().scroll(function(){
        	if(self._triggered){
        		if(btnScrollTimer){
        			clearTimeout(btnScrollTimer);
        		}
        		btnScrollTimer = setTimeout(function(){
    				var pos = _getEditBtnPosition();
            		self._editView.editBtn.animate({"left":pos.left,"top":pos.top},self._editView.editing?"fast":0);
            		btnScrollTimer = null;
    			} , 300);
        	}
        });

      //����б༭����Ľӿ�
     	$.extend($["om"]["omGrid"].prototype , {
     		/** <span style='color:red'>(�������б༭���)��</span>ȡ���༭״̬�������ǰĳ�������ڱ༭״̬��ȡ���˴ε��б༭���൱�ڵ�����б༭���ġ�ȡ������ť��
     		 * @function 
     		 * @name omGrid#cancleEdit
     		 * @returns jQuery����
     		 * @example
     		 * $(".selector").omGrid("cancleEdit");
     		 */
     		cancleEdit : 
     			function(cancleBtn/*�ڲ�ʹ�ã����������ť��Ҳ����ô˷������д���*/){
     				var $editView = self._editView;
			    	if(!_isEditable() || !self._triggered || (self._triggered && !$editView.editing)){
			    		return ;
			    	}
			    	$editView.view.hide();
			    	$editView.editing = false;
					_resetForm();
					cancleBtn && $(cancleBtn).blur();
        		},
        	
        	/** <span style='color:red'>(�������б༭���)��</span>ȡ����ǰ����δ�ύ����̨�ĸı䣬Ҳ���ָ������е�ԭʼ���ݡ�
        	 * @function
        	 * @name omGrid#cancleChanges
        	 * @returns jQuery����
        	 * @example
        	 * $(".selector").omGrid("cancleChanges");
        	 */
        	cancleChanges :
        		function(){       			
        			if(!_isEditable() || !_hasChange()){
        				return ;
        			}
        			self._changeData = {"update":{},"insert":{},"delete":{}};//�������
        			_resetForm();//���ñ༭�������������Ϣ
        			self.refresh();//����dataSource�е����ݽ���ˢ��
        		},	
        
        	/** <span style='color:red'>(�������б༭���)��</span>����ĳһ�н���༭״̬��������������ڱ༭״̬�У���ʲôҲ�������������������ڱ༭״̬�У���ȡ����һ�д˴α༭��Ȼ���н���༭״̬�� 
        	 * @function
        	 * @param index ����������0��ʼ 
        	 * @name omGrid#editRow
        	 * @returns jQuery����
        	 * @example
        	 * $(".selector").omGrid("editRow" , 1);
        	 */
        	editRow : function(index){
        		if(!_isEditable()){
        			return ;
        		}
        		editRenderer.call(self._getTrs().eq(index)[0]);
        	},
        	
        	/** <span style='color:red'>(�������б༭���)��</span>ɾ��ĳһ�У��������������ӵĲ�δ���浽��̨�����������ɾ�������������ԭ���ʹ��ڵģ���ֻ�����ز����б��,��������saveChanges��Ž�������ɾ����
        	 * @function
        	 * @param index ����������0��ʼ 
        	 * @name omGrid#deleteRow
        	 * @returns jQuery����
        	 * @example
        	 * $(".selector").omGrid("deleteRow" , 0);
        	 */
        	deleteRow : function(index){
        		if(!_isEditable()){
        			return ;
        		}
        		var $tr = self._getTrs().eq(index);
        		self.cancleEdit();
        		var rowId = _getRowId($tr);
        		if($tr.attr("_insert")){
        			delete self._changeData["insert"][rowId];
        			$tr.remove();
        		}else{
        			self._changeData["delete"][rowId] = self._rowIdDataMap[rowId];
        			$tr.attr("_delete", "true");
        			$tr.hide();
        		}
        	},
 
        	/** <span style='color:red'>(�������б༭���)��</span>��ȡ����δ������޸ġ����û��ָ��type,���ص������е��޸ģ���ʽΪ: {update:[],insert:[],delete:[]}�����ָ���˲�������
        	 *  ָ����"update"���򷵻� [{},{}]
        	 * @function
        	 * @param type ��ѡֵΪ��"insert","update","delete" 
        	 * @name omGrid#getChanges
        	 * @returns ��ָ�������ͣ�����[]�����򷵻�{update:[],insert:[],delete:[]}
        	 * @example
        	 * $(".selector").omGrid("getChanges" , "update");
        	 */
        	getChanges : function(type){
        		var data = {"update":[] , "insert":[] , "delete":[]},
        			reqType = type? type : "update",
        			changeData = self._changeData,
        			i;
        			
        		if(reqType === "update"){
        			var uData = changeData[reqType];
        			for(i in uData){
        				own.call(uData , i) && data[reqType].push($.extend(true , {} , self._rowIdDataMap[i] , uData[i]));
        			}
        			reqType = type? type : "insert";
        		}
        		if(reqType === "insert"){
        			var iData = changeData[reqType];
        			for(i in iData){
        				own.call(iData , i) && data[reqType].push(iData[i]);
        			}
        			reqType = type? type : "delete";
        		}
        		if(reqType === "delete"){
        			var dData = changeData[reqType];
        			for(i in dData){
        				own.call(dData , i) && data[reqType].push(dData[i]);
        			}
        		}
        		if(type){
        			return data[type];
        		}else{
        			return data;
        		}
        	},
     
    	 	/** <span style='color:red'>(�������б༭���)��</span>��ָ��λ�ö�̬����һ�С�
	    	 * @function
	    	 * @param index ����������0��ʼ����Ϊ"begin","end"�ֱ��ʾ�ڱ����ǰ���������С�
	    	 * @param rowData ��������еĳ�ʼֵ
	    	 * @name omGrid#insertRow
	    	 * @returns jQuery����
	    	 * @example
	    	 * $(".selector").omGrid("insertRow" , "end" , {id:1 , name:"�ɶ�"});
	    	 */
        	insertRow : function(index , rowData){
        		if(!_isEditable()){
        			return ;
        		}
        		if($.isPlainObject(index)){
        			rowData = index;
        			index = 0;
        		}
        		var $trs = self._getTrs();
        		index = ("begin"==index || index==undefined)? 0 : ("end"==index? $trs.length : index);
        		
        		//����������
        		var rd = {};
        		for(var i=0,len=colModel.length; i<len; i++){
        			rd[colModel[i]["name"]] = "";//Ĭ�϶�Ϊ��ֵ
            	}
        		self._changeData["insert"][self._guid] = $.extend(true , rd , rowData);
        		
        		//��������
        		var rowValues=self._buildRowCellValues(colModel,rd,index),
        			trContent = [],
        			rowClasses=options.rowClasses;
        			isRowClassesFn= (typeof rowClasses === 'function'),
        			rowCls = isRowClassesFn? rowClasses(index,rd):rowClasses[index % rowClasses.length],
        			tdTmp = "<td align='$' abbr='$' class='grid-cell-dirty $'><div align='$' class='$' style='width:$px'>$</div></td>";//tdģ��
        			    			
        		trContent.push("<tr class='om-grid-row " + rowCls + "' _grid_row_id="+(self._guid++)+" _insert='true'>");
        		$(gridHeaderCols).each(function(i){
                    var axis = $(this).attr('axis'),
                    	wrap=false,
                    	html,
                    	cols,
                    	j;
                    if(axis == 'indexCol'){
                        html="<a class='om-icon'>����</a>";
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
                    cols = [this.align , this.abbr , axis , this.align , wrap?'wrap':'', $('div',$(this)).width() , html];
                    j=0;
                    trContent.push(tdTmp.replace(/\$/g , function(){
                    	return cols[j++];
                    }));
                });
                trContent.push("</tr>");
        		
        		var $tr = $(trContent.join(" "));
        		index==0? $tr.prependTo($elem.find(">tbody")) : $trs.eq(index-1).after($tr);
        		
        		self.editRow(index);
        	},
        	
        	/** <span style='color:red'>(�������б༭���)��</span>����ͻ������ݡ�ע�⣬�˷��������ύ���󵽺�̨�����ǻ���Ϊ���е����ݸı䶼�Ѿ��ɹ��ύ����̨ȥ�ˣ���������������������ݱ�־��
        	 * һ������£������Լ��ı��淽���¼��ص��У�����getChanges������ȡ��ǰ���еĸı䣬���Լ��ύ����̨��Ȼ���ڳɹ��ص��������ٵ��ñ�������
        	 * һ�����ñ�������cancleChanges�������޷��Ե��ô˷���ǰ�����иı������õġ�
	    	 * @function
	    	 * @name omGrid#saveChanges
	    	 * @returns jQuery����
	    	 * @example
	    	 * $(".selector").omGrid("saveChanges");
	    	 */
        	saveChanges : function(){
    			if(!_isEditable() || !_hasChange()){
    				return ;
    			}
    			var changeData = self._changeData,
    				rowsData = self.pageData.data.rows,
    				uData = changeData["update"],
    				dData = changeData["delete"],
    				$trs = self.element.find("tr.om-grid-row"),
    				newRowsData = [];
    			for(var i in uData){
    				if(own.call(uData , i)){
    					$.extend(true , self._rowIdDataMap[i] , uData[i]);
    				}
    			}
    			$trs.each(function(index , tr){
    				var $tr = $(tr);
    				if($tr.attr("_delete")){
    					$tr.remove();
    				}else{
    					newRowsData.push(_getRowData(tr));
    				}
    			});
    			self.pageData.data.rows = newRowsData;
    			self._changeData = {"update":{},"insert":{},"delete":{}};//�������
    			_resetForm();//���ñ༭�������������Ϣ
    			self.refresh();//����dataSource�е����ݽ���ˢ��
        	},
        	/**
        	 * (����)��ȡ���µ���������
        	 */
        	getData : function(){
        		var result = this.pageData.data,
    				$trs = self._getTrs();
    				
        		if(_isEditable() && _hasChange()){
        			result = {total:result.total};
        			result.rows = [];
    				$trs.each(function(index , tr){
	    				result.rows.push(self._getRowData(index));
    				});
    			}
    			return result;
        	},
        	/**
        	 * (����)��ȡ���µ������ݡ����ڿ��Բ����µ������У����Դ˷���Ҫ������д��
        	 */
        	_getRowData : function(index){
        		var $tr = this._getTrs().eq(index),
        			rowId = _getRowId($tr),
        			rowData;
        		if($tr.attr("_insert")){
        			rowData = self._changeData.insert[rowId];
        		}else{
        			var origRowData = self._rowIdDataMap[rowId],
        				uData = self._changeData["update"];
        			rowData = origRowData;
        			if(uData[rowId]){
        				rowData = $.extend(true , {} , origRowData , uData[rowId]);
        			}
        		}
        		return rowData;
        	}
     	});
		
        function editRenderer(){
        	var $tr = $(this),
        	$editRow,
        	$editForm,
        	scrollLeft;
        	
        	if(!_isEditable()){
        		return ;
        	}
        		
        	//�����insertEditModeģʽ����ô���Ǹ����������ģ����򲻿ɱ༭��ֱ�ӷ���
        	if(!self._allEditMode && !$tr.attr("_insert")){
        		return ;
        	}
        	
        	//��ǰ�������ڱ༭״̬��ֱ�ӷ���
        	if(self._triggered  
        		&& self._editView.editing
        		&& _getRowId($tr) == self._editView.rowId){
				return ;        		
        	}
        	
        	_showEditView(this);
        	$editRow = self._editView.editRow;
        	$editForm = $editRow.find(">.grid-edit-form");
        	scrollLeft = $elem.parent().scrollLeft();
        	
        	$(gridHeaderCols).each(function(index){
            	var axis = $(this).attr('axis'),
					model,
					$cell = $tr.find("td:eq("+index+")"),
					name,//�༭���input������֣�����У���������
					compKey;//ָeditComps��key
            	if(axis.substring(0,3)=='col'){
                 	var colIndex=axis.substring(3);
                 	model = colModel[colIndex];
            	}else{
            		if($.isEmptyObject(self._editComps)){//��֤�ٴα༭������ʱ�����ظ���� padding-left.
            			$editRow.css("padding-left", parseInt($editRow.css("padding-left")) + $cell.outerWidth());
            		}
            		return ;
            	}
            	var editor = model.editor;
            	if(!self._triggered){
            		//����в��ɱ༭����Ĭ��type="text"
                	//�в��ɱ༭������: 
                	//(1)colModelû��editor����
                	//(2)colModel��editor���ԣ�����editor��editable���ԣ���ôeditable===false�򲻽��б༭������editableΪ�����ҷ���falseҲ�����б༭��
    				if(!editor || 
    	            	(editor && 
    	            		(editor.editable===false || 
    	                    	($.isFunction(editor.editable) && editor.editable()===false) ) ) ){
    					var renderer = editor && editor.renderer;
    	       			model.editor = editor = {};
    	       			editor.type = "text";
    	       			if(renderer){
    	       				editor.renderer = renderer;
    	       				editor.type = "custom";
    	       			}
    	       			editor.editable = false;
    	   			}else{
    	   				editor.type = editor.type || "text";
    	   				editor.editable = true;
    	   				if(editor.rules){
    	   					self._validate = true;//ֻ����Ҫ�������Ҫ���м���
    	   				}
    	   			}
    	   			compKey = model.editor.name || model.name;
    	   			editor.options = editor.options || {};
    	   			self._editComps[compKey] = {};
            	}else{
            		compKey = model.editor.name || model.name;
            	}
            	editComp = self._editComps[compKey];
	   			lastValue = _getLastValue($tr , model) || "";
	   			
	   			//�ɱ༭���ҿ�У�飬��Ӷ�Ӧ�ĳ�����Ϣ��ʾ����
	   			if(!self._triggered && editor.editable && editor.rules){
	   				self._errorHolders[compKey] = $("<div class='errorContainer' style='display:none'></div>").appendTo($elem.parent());
	   			}
	   			var $ins = editComp.instance,
	   				$wrapper,
	   				type = editor.type;
	   			if(!$ins){
	   				$wrapper = $("<div style='position:absolute'></div>").css({left:$cell.position().left+scrollLeft,top:3}).appendTo($editForm).addClass("grid-edit-wrapper"); 
	   				$ins = editComp.instance = $("<input></input>").attr({"name":compKey,"id":compKey}).appendTo($wrapper);
	   				if("text"!=type && "custom"!=type){//ʵ�������
	   					$ins[type](editor.options);
	   				}
	   				if("omCalendar"==type || "omCombo"==type){
	   					var $parent = $ins.parent();
	   					if("omCalendar"==type){
	   						$ins.val(lastValue).width($cell.outerWidth()-24);
	   					}
	   					$ins.width($cell.outerWidth(true) - ($parent.outerWidth(true) - $ins.width()));
	   				}else{
	   					if("text"==type){
	   						$ins.addClass("grid-edit-text");
	   						if(!editor.editable){
	   							$ins.attr("readonly" , "readonly").addClass("readonly-text");
	   						}
	   					}
	   					if("custom"==type){
	   						$wrapper.html(editor.renderer(lastValue));
	   					}
	   					$ins.width($cell.outerWidth(true) - ($ins.outerWidth(true) - $ins.width()));
	   				}
	   				editComp.model = model;
					editComp.type = type;
					editComp.id = model.name;
	   			}
   				switch(type){
   					case "omCalendar":
   						$ins = $ins.val(lastValue).omCalendar();
   						break;
   					case "omNumberField":
   						$ins.val(lastValue).trigger("blur");//���д�����
   						break;
   					case "omCombo":
   						$ins.omCombo("value" , lastValue);
   						break;
   					case "text":
   						$ins.val(lastValue);
   						break;
   					default:;
   				}
            });
            !self._triggered && self._validate && _bindValidation();
            	
            self._validator && self._validator.form();//����У��
        	self._triggered = true;
        }
    });
    
    function _getEditBtnPosition(){
		var $elem = self.element,
			$bDiv = $elem.parent(),
			ev = self._editView,
			$editView = ev.view,
			$editBtn = ev.editBtn,
			$editRow = ev.editRow,
			pos = {};
			
		pos.top = $editRow.height();
		if($elem.width() < $bDiv.width()){
			pos.left = $editBtn.parent().width()/2 - $editBtn.width()/2;
		}else{
			pos.left = $bDiv.scrollLeft() + $bDiv.width()/2 - $editBtn.width()/2;
		}
		return pos;
    }
    
    function _onRefresh(){
    	if(_isEditable()){
    		this._changeData = {"delete":{},"insert":{},"update":{}}; //���ݸı��ڲ�������Ҫ���³�ʼ��   
    		_buildRowIdDataMap(this);
    		if(self._triggered){
				_resetForm();
				self._editView.view.hide();
				self._editView.editing = false;
				self.hDiv.scrollLeft(0);
				self.element.parent().scrollLeft(0);
    		}
    	}
	}
    
    function _isEditable(){
    	return !self._allEditMode || self._globalEditable;
    }
    
	//����rowId��ԭ�������ݵ�һһӳ�䡣
	function _buildRowIdDataMap(){
		var rowsData = self.getData().rows;
    	self._rowIdDataMap = {};
    	self._getTrs().each(function(index , tr){
    		//�е�������ԭ�����ݵ�ӳ�䣬����ͨ��rowId��ȡԭ���е����ݡ�
    		self._rowIdDataMap[_getRowId(tr)] = rowsData[index];
    	});
	}
	
	//����У�����ͬʱ���������Ϣ
	function _resetForm(){
		if(self._validator){
			self._validator.resetForm();
			//��մ�����Ϣ
			$.each(self._errorHolders,function(name , errorHolder){
    			errorHolder.empty();
			});
		}
	}
	
	function _hasChange(){
		var changeData = self._changeData;
		return !($.isEmptyObject(changeData["update"]) && $.isEmptyObject(changeData["insert"]) && $.isEmptyObject(changeData["delete"]));
	} 
	
    //��ʾ�ɱ༭����ͼ
	function _showEditView(tr){
		var $elem = self.element,
			$editView = $elem.next(".grid-edit-view"),
			$editBtn,
			$editRow,
			position = $(tr).position();
		if($editView.length == 0){
			$editView = $("<div class='grid-edit-view'><div class='body-wrapper'><div class='grid-edit-row'><form class='grid-edit-form'></form></div>"
					+"<div class='gird-edit-btn'><input type='button' class='ok' value='����'/><input type='button' class='cancle' value='ȡ��'/></div></div></div>")
				.width($elem.outerWidth())
				.insertAfter($elem);
			$editBtn = $editView.find(".gird-edit-btn"),
			$editRow = $editBtn.prev(".grid-edit-row"),
				pos;
			self._editView = {view:$editView , editRow:$editRow , editBtn:$editBtn};//���л���
			pos = _getEditBtnPosition();
			$editBtn.css({"left": pos.left,"top":pos.top});
			//�󶨰�ť���¼�
			var $okBtn = $editBtn.find("input.ok").omButton(),
				$cancleBtn = $editBtn.find("input.cancle").omButton();
			$okBtn.click(function(){
				//�����ٴν���У�飬��Ҫ�������û�����Լ�������Щ�༭�������ֵ�ǲ��ᴥ��У���
				if(self._validator && !self._validator.form()){
					return ;
				}
				//���ڱհ���ԭ�����ﲻ����ֱ��ʹ��tr,��Ȼ��Զ����ָ��ͬһ��tr
				 _saveEditValue($elem.find("tr[_grid_row_id='"+self._editView.rowId+"']"));
				 $editView.hide();
				 self._editView.editing = false;
				 $okBtn.blur();
			});
			$cancleBtn.click(function(){
				self.cancleEdit(this);
			});
		}
		self._editView.rowId = _getRowId(tr);//��ǰ���ڱ༭���е�id
		if(self._editView.editing){//�����ǰ���ڱ༭����ô����Ҫ���ж�����
			$editView.animate({"top":position.top}, "fast");
		}else{
			$editView.css({"top":position.top});
			self._editView.editing = true;
			$editView.show();
			if(self._colWidthResize){
				//���¼�������༭����Ŀ��
				var scrollLeft = $elem.parent().scrollLeft();
				$editBtn = $editView.find(".gird-edit-btn");
				$editView.width($elem.outerWidth());
				self.hDiv.find("th[axis^=col]").each(function(index , th){
					var id = $(th).attr("abbr"),
						$th = $(th);
					$.each(self._editComps , function(name , comp){
						var $ins = comp.instance,
							type = comp.type;
						if(id == comp.id){
							$ins.closest("div.grid-edit-wrapper").width($th.outerWidth()).css("left" , $th.position().left + scrollLeft);
							//�ı�༭����������Ŀ��
							if("omCalendar"==type || "omCombo"==type){
								var $parent = $ins.parent();
								if("omCalendar"==type){
			   						$ins.width($th.outerWidth()-24);
			   					}
			   					$ins.width($th.outerWidth(true) - ($parent.outerWidth(true) - $ins.width()));
							}else{
								$ins.width($th.outerWidth(true) - ($ins.outerWidth(true) - $ins.width()));
							}
						}
					});
				});
				var pos = _getEditBtnPosition();
				$editBtn.css({"left":pos.left,"top":pos.top});
				self._colWidthResize = false;
			}
		}
	}
	
	function _onResizable($th , differWidth){
    	//������Ǵ��ڱ༭״̬�����ڱ༭��������״̬�ģ���ʱ���������༭�����Ⱥܿ��ܻ��Ǵ���ģ����ԷǱ༭״̬��ʲôҲ������������ʾ�༭��ʱ��������
    	if(!_isEditable() || !this._triggered || !this._editView.editing){
    		this._colWidthResize = true;
    		return ;
    	}
    	var ev = self._editView;
    		$editView = ev.view,
    		$editBtn = ev.editBtn;
		$editView.width(self.element.outerWidth());
		
		var $ths = self.hDiv.find("th"),
			first = true;
		self.hDiv.find("th:gt("+($ths.index($th)-1)+")").each(function(index , th){
			var id = $(th).attr("abbr"),
				$th = $(th);
			$.each(self._editComps , function(name , comp){
				var $ins = comp.instance,
					type = comp.type;
				if(id == comp.id){
					if(!first){
						$ins.closest("div.grid-edit-wrapper").css("left" , "+="+differWidth);
					}
					if(first){
						//�ı�༭����������Ŀ��
						if("omCalendar"==type || "omCombo"==type){
							var $parent = $ins.parent();
							if("omCalendar"==type){
		   						$ins.width($th.outerWidth()-24);
		   					}
		   					$ins.width($th.outerWidth(true) - ($parent.outerWidth(true) - $ins.width()));
						}else{
							$ins.width($th.outerWidth(true) - ($ins.outerWidth(true) - $ins.width()));
						}
					}
					first = false;
				}
			});
		});
		var pos = _getEditBtnPosition();
		$editBtn.animate({"left":pos.left,"top":pos.top},"fast");
    }
	
	function _saveEditValue(tr){
		var $tr = $(tr),
			$editRow = self._editView.editRow,
			comps = self._editComps,
			rowId = _getRowId($tr),
			index = self._getTrs().index($tr),
			rowData = self._getRowData(index);
			
		$.each(comps , function(name , comp){
			var key = comp.model.name,
				newValue = _getCompValue($tr , comp),
				originalValue,
				html,
				updateRowData;
				
			if($tr.attr("_insert")){
				self._changeData.insert[rowId][key] = newValue;
			}else{
				originalValue = _getRowData(tr)[key];
				updateRowData = self._changeData.update[rowId];
				if(newValue == originalValue){
					_toggleDirtyFlag($tr , comp.model , false);
					updateRowData && delete updateRowData[key];
					$.isEmptyObject(updateRowData) && delete self._changeData.update[rowId];
				}else{
					_toggleDirtyFlag($tr , comp.model , true);
					updateRowData = self._changeData.update[rowId] = updateRowData || {};
					updateRowData[key] = newValue;
				}
			}
			//���»ر��
			if(comp.model.renderer){
				html = comp.model.renderer(newValue , rowData ,index);
			}else{
				html = newValue? newValue : "";
			}
			$tr.find("td[abbr='"+key+"'] >div").html(html);
		});
	}
	
	//�������ı�־��ʽ��show=true��ʾ��ʾ�����ѱ�������ʽ
	function _toggleDirtyFlag($tr , model , show){
		$tr.find("td[abbr='"+model.name+"']").toggleClass("grid-cell-dirty" , show);
	}
	
	function _getRowId(tr){
		return $(tr).attr("_grid_row_id");
	}
	
	//��ȡ�༭�����ж�Ӧ�������ֵ
	function _getCompValue($tr , comp){
		var value,
			rowData = _getRowData($tr);
		switch(comp.type){
		case "omCalendar":
			value = comp.instance.val();
		case "omNumberField":
			value = comp.instance.val();
			break;
		case "omCombo":
			value = comp.instance.omCombo("value");
			break;
		case "text":
			value = comp.instance.val();
			break;
		default:
			break;	
		}
		return value;
	}
	
	//��ȡĳ�����µ�ֵ������������ģ���������߻�ȡ��������¹��ˣ��Ӹ�����߻�ȡ����ֵ
	function _getLastValue($tr , model){
		var value,
			name = model.name;
		if($tr.attr("_insert")){
			//�����Ļ���insert����õ����µ�ֵ
			value = _getRowData($tr)[name];
		}else{
			var updateData = self._changeData.update[_getRowId($tr)];
			if(updateData && updateData[name] != null){//�����ݱ����¹���
				value = updateData[name];//����ֵ
			}else{//��ȡԭʼֵ
				value = _getRowData($tr)[name];
			}
		}
		return value;
	}
	
	//��ȡԭʼ�����ݣ����������ӽ�ȥ�ģ���ȡ��������ӽ�ȥ��������
	function _getRowData(tr){
		var rowId = _getRowId(tr);
		return $(tr).attr("_insert")?self._changeData.insert[rowId] : self._rowIdDataMap[rowId];
	}
	
	function _bindValidation(){
		var $editForm = self._editView.editRow.find(">.grid-edit-form"),
			valiCfg = {},
			rules = valiCfg.rules = {},
			messages = valiCfg.messages = {},
			colModel = self.options.colModel;
		$.each(colModel , function(index , model){
			var customRules = model.editor.rules;
			if(customRules){
				var r = rules[model.editor.name || model.name] = {},
					msg = messages[model.editor.name || model.name] = {};
				if(customRules.length>0 && !$.isArray(customRules[0])){
					var temp = [];
					temp.push(customRules);//��װ��[[],[]]����ͳһ��ʽ
					customRules = temp;
				}
				for(var i=0,len=customRules.length; i<len; i++){
					var name = customRules[i][0];//��������
					r[name]  = customRules[i][1] == undefined? true : customRules[i][1]; //û�ж���ֵ��ͳһ�� true
					if(customRules[i][2]){
						msg[name] = customRules[i][2];
					}
				}
			}
		});	
		
		$.extend(valiCfg , {
			onkeyup : function(element){
				this.element(element);
			},
			//���븲�Ǵ˷�������Ȼ��Ĭ�����ɴ�����Ϣ��������������Ϣ�Ĳ����Ѿ���showErrows�����ˣ����Դ˷���ʲôҲ����
			errorPlacement : function(error, element){
			},
			showErrors : function(errorMap, errorList){
				if(errorList && errorList.length > 0){
		        	$.each(errorList,function(index,obj){
		        		var $elem = $(obj.element),
		        			name = $elem.attr("name");
		        		var errorHolder = self._errorHolders[name];
		        		if(errorHolder){
		        			var docPos = $elem.offset(),
		        				tablePos = self.element.offset();
		        			errorHolder.css({left:docPos.left-tablePos.left+$elem.outerWidth(),top:docPos.top-tablePos.top+$elem.outerHeight()}).html(obj.message);
		        			if($elem.is(":focus")){
		        				errorHolder.show();
		        			}
		        		}
	 	            });
		    	}else{
		    		$.each(this.currentElements , function(index , elem){
		    			var errorHolder = self._errorHolders[$(elem).attr("name")];
		    			errorHolder && errorHolder.empty().hide();
		    		});
		    	}
		    	//����"����"��ť��״̬
		    	var $okBtn = self._editView.editBtn.find("input.ok"),
		    		correct = true;
		    	$.each(self._errorHolders,function(name , errorHolder){
		    		if(!errorHolder.is(":empty")){
		    			return correct = false;
		    		}
		    	});
		    	correct ? $okBtn.omButton("enable"): $okBtn.omButton("disable");
		    	this.defaultShowErrors();
			}
		});
		self._validator = $editForm.validate(valiCfg);
		
		//������¼�
		$.each(self._editComps , function(name , comp){
			var editor = comp.model.editor;
			if(editor.editable && editor.rules){
				var key = editor.name || comp.model.name,
					errorHolder = self._errorHolders[key];
				comp.instance.mouseover(function(){
					if(errorHolder && !errorHolder.is(":empty")){
						errorHolder.show();
					}
				})
				.mouseout(function(){
					errorHolder && errorHolder.hide();
				});
			}
		}); 
	}
})(jQuery);
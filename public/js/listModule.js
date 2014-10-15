/**
 * Created by Administrator on 14-7-15.
 */
var uwa = uwa || {};

uwa.listModuleDic = {};
uwa.listModule = function (name, tabName, sid) {
    if (!uwa.listModuleDic[name]) {
        var module = new uwa.DataGrid(name);
        module.opts({
            sid: sid
        });
        module.name = name;
        module.tabName = tabName;
        module.con_content = "#div-content";
        module.con_list = "#div-list-" + name;

        module.initContent = function (data) {
            if ($(this.con_list).length <= 0) {
                $(this.con_content).tabs('add', {
                    title: this.tabName,
                    closable: true
                });
                var tab = $(this.con_content).tabs('getTab', this.tabName);
                tab.attr('id', this.con_list.replace('#', ''));
                tab.css('padding', '10px');
            }
            $(this.con_list).html(data);
            $.parser.parse($(this.con_list));//这里必须要初始化，不然布局会乱
            $(this.con_content).tabs('select', this.tabName);

            $("#hidden-sid").val(this.sid);
        };

        uwa.listModuleDic[name] = module;
    }
    return uwa.listModuleDic[name];
};

uwa.DataGrid = function (moduleName) {
    this.sid = "";//服务器链接
    this.selectPageNumber = 1;
    this.selectPageSize = 50;
    this.selectRowData = null;
    this.moduleName = moduleName;
    //url
    this.url_list = "/" + moduleName + "/list";
    this.url_list_data = "/" + moduleName + "/list_data";
    this.url_edit = "/" + moduleName + "/edit";
    this.url_edit_post = "/" + moduleName + "/edit_post";
    this.url_add = "/" + moduleName + "/add";
    this.url_add_post = "/" + moduleName + "/add_post";
    this.url_show = "/" + moduleName + "/show";
    this.url_del_post = "/" + moduleName + "/del_post";
    //control
    this.con_datagrid = "#div-datagrid-" + moduleName;
    this.con_form_search = "#form-search-" + moduleName;
    this.con_form_add = "#form-add-" + moduleName;
    this.con_form_edit = "#form-edit-" + moduleName;
    this.con_window = "#div-window";

    var self = this;
    this.opts = function (opts) {
        for (var key in opts) {
            self[key] = opts[key];
        }
    };
    this.load = function () {
        this.roadBefore();
        $.get(this.url_list, {sid: self.sid}, function (data) {
            self.initContent(data);
            self.initCon();
            $(self.con_datagrid).datagrid({
                onDblClickRow: function (index, rowData) {
                    self.selectRowData = rowData;
                    self.openWindowShow(rowData.id);
                },
                onClickRow: function (index, rowData) {
                    self.selectRowData = rowData;
                }
            });
            self.initData();
        });
    };
    //重写用
    this.initContent = function (data) {

    };
    this.initCon = function () {
        $("#div-list-" + this.moduleName + " #a-open-add-" + this.moduleName).click(function () {
            self.openWindowAdd();
        });
        $("#div-list-" + this.moduleName + " #a-open-edit-" + this.moduleName).click(function () {
            self.openWindowEdit();
        });
        $("#div-list-" + this.moduleName + " #a-open-del-" + this.moduleName).click(function () {
            self.postDel();
        });
        $("#div-list-" + this.moduleName + " #a-search-" + this.moduleName).click(function () {
            self.postSearch();
        });
    };
    this.roadBefore = function () {
        this.selectPageNumber = 1;
        this.selectPageSize = 50;
        this.selectRowData = null;
    };

    this.initData = function (pageNumber, pageSize) {
        $(self.con_datagrid).datagrid('loading');
        if (typeof pageNumber == "undefined") {
            pageNumber = this.selectPageNumber;
        }
        if (typeof pageSize == "undefined") {
            pageSize = this.selectPageSize;
        }
        this.selectPageNumber = pageNumber;
        this.selectPageSize = pageSize;

        var searchParam = $(this.con_form_search).serialize();
        $.post(this.url_list_data + '/?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&sid=' + self.sid, searchParam, function (data) {
            $(self.con_datagrid).datagrid({data: JSON.parse(data)});
            var pager = $(self.con_datagrid).datagrid().datagrid('getPager');	// get the pager of datagrid
            pager.pagination({
                pageSize: pageSize,
                pageNumber: pageNumber,
                pageList: [20, 50, 100, 200],
                onSelectPage: function (pageNumber, pageSize) {
                    self.initData(pageNumber, pageSize);
                }
            });
        });
    };

    this.openWindowAdd = function () {
        $.get(this.url_add, {}, function (data) {
            $(self.con_window).html(data);
            self.openWindow();
        });
    };

    this.openWindowEdit = function (id) {
        if (typeof id == "undefined") {
            if (this.selectRowData) id = this.selectRowData.id;
        }

        $.get(this.url_edit, {id: id, sid: self.sid}, function (data) {
            $(self.con_window).html(data);
            self.openWindow();
        });
    };

    this.openWindowShow = function (id) {
        $.get(this.url_show, {id: id, sid: self.sid}, function (data) {
            $(self.con_window).html(data);
            self.openWindow();
        });
    };

    this.openWindow = function () {
        $(this.con_window).window('open');
        var str = self.con_window + " #a-close-" + this.moduleName;
        $(self.con_window + " #a-close-" + this.moduleName).click(function () {
            self.closeWindow();
        });
        $("#div-show-" + this.moduleName + " #a-open-edit-" + this.moduleName).click(function () {
            self.openWindowEdit();
        });
        $("#div-edit-" + this.moduleName + " #a-post-edit-" + this.moduleName).click(function () {
            self.postEdit();
        });
        $("#div-add-" + this.moduleName + " #a-post-add-" + this.moduleName).click(function () {
            self.postAdd();
        });
    };

    this.closeWindow = function () {
        $(self.con_window).window('close');
        $(self.con_window).html('');
    };

    this.postAdd = function () {
        $.post(this.url_add_post + "?sid=" + self.sid, $(self.con_form_add).serialize(), function (data) {
            if (data != "1") {
                $.messager.alert('提示', data, 'error');
            } else {
                self.closeWindow();
                self.initData();
            }
        });
    };

    this.postEdit = function (id) {
        $.post(this.url_edit_post + "?id=" + id + "&sid=" + self.sid, $(self.con_form_edit).serialize(), function (data) {
            if (data != "1") {
                $.messager.alert('提示', data, 'error');
            } else {
                self.closeWindow();
                self.initData();
            }
        });
    };

    this.postDel = function () {
        if (!this.selectRowData) {
            $.messager.alert('提示', '木有选择任何项啊，亲!', 'error');
        } else {
            var id = this.selectRowData.id;
            $.messager.confirm('ID:' + id, '确定删除ID为(' + id + ')的数据吗?', function (r) {
                if (!r) return;
                $.post(self.url_del_post + "?id=" + id + "&sid=" + self, "", function (data) {
                    if (data != "1") {
                        $.messager.alert('提示', data, 'error');
                    } else {
                        self.initData();
                    }
                });
            });
        }
    };

    this.postSearch = function () {
        this.initData(1);
    };
};

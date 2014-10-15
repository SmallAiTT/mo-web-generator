/**
 * Created by Administrator on 14-7-17.
 */
var uwa = uwa ||{};
uwa.openSelectItem = function(){
    $('#div-window-2').window('open');
    //uwa.cacheBagHtml = null;
    if(!uwa.cacheBagHtml){
        $.get('/user/bag',{},function(data){
            uwa.cacheBagHtml = data;
            $('#div-window-2').html(uwa.cacheBagHtml);
        });
    }else{
        $('#div-window-2').html(uwa.cacheBagHtml);
    }
};
uwa.selectItem = function(id,name,num){
    $('#add-item-id').val(id);
    $('#add-item-name').val(name);
    $('#add-item-num').val(num);
};
uwa.initBagList = function(){
    var bag = JSON.parse($('#input-bag').val());
    var bagData = JSON.parse($('#div-bagData').html());

    var id = $('#add-item-id').val();
    var name = $('#add-item-name').val();
    var num = $('#add-item-num').val();

    if(id){
        bag[id] = num;
        bagData[id] = {name:name,num:num};
        if(num<=0){
            delete bag[id];
            delete bagData[id];
        }
    }

    var itemHtml = "";
    for(var key in bagData){
        var locItem = bagData[key];
        itemHtml +='<li style="cursor:pointer;" onclick=\'uwa.selectItem("'+key+'","'+locItem.name+'","'+locItem.num+'")\'>'+locItem.name+'('+locItem.num+')</li>';
    }
    $("#ul-bag").html(itemHtml);
    $('#input-bag').val(JSON.stringify(bag));
    $('#add-item-id').val(0);
    $('#add-item-name').val('');
    $('#add-item-num').val(0);
};
uwa.selectItemAndClose = function(id,name){
    uwa.selectItem(id,name,1);
    $('#div-window-2').window('close');
};
uwa.openHeroList = function(userId){
    $("#hidden-sid").val();
    $('#div-window-2').window('open');
    var sid = $("#hidden-sid").val();
    var grid =  new uwa.DataGrid("hero");
    grid.opts({
        sid: sid,
        con_window:'#div-window-3'
    });
    grid.con_list = '#div-window-2';
    grid.initContent = function (data) {
        $(this.con_list).html(data);
        $.parser.parse($(this.con_list));//这里必须要初始化，不然布局会乱
        $('#input-userId-hero').attr('readonly','readonly');
        $('#input-userId-hero').val(userId);
    };
    grid.load();
};

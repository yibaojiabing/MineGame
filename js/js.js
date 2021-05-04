function Main(tr,td,num){
    this.tr = tr;   //行数
    this.td = td;   //列数
    this.num = num;    //雷的数量
    this.squares = [];   //存储所有方块的信息，是个二维数组，按行和列顺序排放，存取都是按行和列的形式
    this.tds = [];      //存储所有单元格的DOM
    this.surplusMain = num;    //剩余雷的数量
    this.allRight = false;     //右点击的小旗是否全是雷，用来判断用户是否游戏成功
    this.parent = document.querySelector(".gameBox")
}

Main.prototype.randomNum = function(){
    let square = new Array(this.tr*this.td);
    for(let i=0;i<square.length;i++){
        square[i]=i;
    }
    square.sort(function(){return 0.5-Math.random()});
    return square.slice(0,this.num);
}

Main.prototype.init=function(){
    let rn = this.randomNum();
    let n = 0;
    for(let i=0;i<this.tr;i++){
        this.squares[i]=[];
        for(let j=0;j<this.td;j++){
            // n++;
            if(rn.indexOf(++n)!=-1){
                this.squares[i][j]={type:"mine",x:j,y:i};
            }else{
                this.squares[i][j]={type:"number",x:j,y:i,value:0};
            }
        }
    }
    this.parent.oncontextmenu = function(){
        return false
    }
    // console.log(this.squares);
    this.updateNum()
    this.createDom()
    //剩余雷数
    this.numDom = document.querySelector('.num')
    this.numDom.innerHTML = this.surplusMain
}

Main.prototype.createDom = function(){
    let This = this;
    let table = document.createElement("table");
    for(let i=0;i<this.tr;i++){   //行
        let domTr = document.createElement("tr");
        this.tds[i] = [];
        for(let j=0;j<this.td;j++){   //列
            let domTd = document.createElement("td");
            domTd.pos = [i,j]  //把格子对应的行与列存在格子身上，为了下面通过这个值去数组里取到对应的数据
            domTd.onmousedown = function(){
                This.play(event,this)  //This是指实例对象，this指的是点击的那个td
            }
            // domTd.innerHTML = this.squares[i][j].value;
            this.tds[i][j] = domTd;    //把所有创建的td添加到数组中
            // if(this.squares[i][j].type=='mine'){
            //     domTd.className = 'mine'
            // }
            // if(this.squares[i][j].type=='number'){
            //     domTd.innerHTML = this.squares[i][j].value
            // }
            
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = ''   //避免多次点击创建多个
    this.parent.appendChild(table);
}

Main.prototype.getAround = function(square){
    let x = square.x;
    let y = square.y;
    let result = [];
//x-1,y-1    x,y-1     x+1,y-1     
//x-1,y      x,y       x+1,y
//x-1,y+1    x,y+1     x+1,y+1
    //通过坐标去循环九宫格
    for(let i=x-1;i<=x+1;i++){
        for(let j=y-1;j<=y+1;j++){
            if(i<0||  //格子超出左边范围
                j<0||  //格子超出上边范围
                i>this.td-1||  //格子超出右边范围
                j>this.tr-1||  //格子超出下边范围
                (i==x&&j==y)||  //当前循环到的格子是自己
                this.squares[j][i].type=='mine'  //周围格子是个雷
                ){
                    continue
                }
                result.push([j,i])
        }
    }

    return result;
}

Main.prototype.updateNum = function(){
    for(let i=0;i<this.tr;i++){
        for(let j=0;j<this.td;j++){
            //要更新的是雷周围的数字
            if(this.squares[i][j].type=='number'){
                continue
            }
            let mineNum = this.getAround(this.squares[i][j])
            for(let k=0;k<mineNum.length;k++){
                this.squares[mineNum[k][0]][mineNum[k][1]].value+=1
            }
        }
    }
}

Main.prototype.play = function(ev,obj){
    let This = this
    if(ev.which == 1 && obj.className!='flag'){//后面的条件是为了限制用户标完小红旗后就不能左键点击
        //点击的是左键
        let curSquare = this.squares[obj.pos[0]][obj.pos[1]]
        let cl = ['zero','one','two','three','four','five','six','seven','eight']
        // console.log(curSquare)
        if(curSquare.type=='number'){
            //点到数字
            // console.log("number")
            obj.innerHTML = curSquare.value
            obj.className = cl[curSquare.value]
            //如果数字为0，则不显示
            if(curSquare.value == 0){
                obj.innerHTML = ''
                function getAllZero(square){
                    let around = This.getAround(square) 
                    for(let i=0;i<around.length;i++){
                        let x = around[i][0]    //行
                        let y = around[i][1]    //列
                        This.tds[x][y].className = cl[This.squares[x][y].value]
                        if(This.squares[x][y].value==0){
                            //如果以某个格子为中心找到的格子值为0，那就需要接着调用函数（递归）
                            if(!This.tds[x][y].check){
                                //给对应的td添加一个属性，这条属性用于决定这个格子有没有被找过，如果找过的话，她
                                //的值就为true，下一次就不会再找了
                                This.tds[x][y].check=true
                                getAllZero(This.squares[x][y])
                            }
                        }else{
                            //如果以某个格子为中心找到的四周格子的值不为0，那就把人家的数字显示出来
                            This.tds[x][y].innerHTML = This.squares[x][y].value
                        }
                    }
                }
                getAllZero(curSquare)
            }
        }else{
            //点到雷
            // console.log("mine")
            this.gameOver(obj);
        }
    }
    //用户点击的是右键
    if(ev.which==3){
        //如果右击的是一个数字，那就不能点击
        if(obj.className && obj.className!='flag'){
            return
        }
        //切换flag
        obj.className = obj.className == 'flag'?'':'flag'
        if(this.squares[obj.pos[0]][obj.pos[1]].type=='mine'){
            this.allRight = true  //用户标的小红旗背后都是雷
        }else{
            this.allRight = false
        }
         if(obj.className == 'flag'){
             this.numDom.innerHTML = --this.surplusMain
         }else{
             this.numDom.innerHTML = ++this.surplusMain
         }

         if(this.surplusMain==0){
             //剩余的数量为0，表示用户已经标完小红旗了，这时候要判断游戏是成功还是失败
             if(this.allRight){
                 alert("恭喜你，游戏通过")
             }else{
                 alert("游戏失败")
                 this.gameOver()
             }
         }
    }

}
//游戏失败函数
Main.prototype.gameOver = function(clickTd){
//显示所有的雷
//取消所有格子的点击时间
//给点中的雷标上红

    for(let i=0;i<this.tr;i++){
        for(let j=0;j<this.td;j++){
            if(this.squares[i][j].type=='mine'){
                this.tds[i][j].className='mine'
            }
            this.tds[i][j].onmousedown = null
        }
    }
    if(clickTd){
        clickTd.style.backgroundColor="#f00"
    }
}


//上边button的功能
let btns = document.querySelectorAll('.level button')
let main = null   //用来存储生成的实例
let ln = 0   //用户处理当前选中的状态
let arr = [[9,9,10],[16,16,40],[28,28,99]]   //不同级别的行数列数雷数

for(let i=0;i<btns.length-1;i++){
    btns[i].onclick = function(){
        btns[ln].className = ''
        this.className = 'active'   
        main = new Main(...arr[i])
        main.init()
        ln = i
    }
}
btns[0].onclick()//初始化默认低级
btns[3].onclick = function(){
    main.init()
}


// let main = new Main(28,28,99);
// main.init();
// console.log(main.getAround(main.squares[0][0]))
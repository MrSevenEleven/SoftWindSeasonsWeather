class canvasEffect {
    constructor(canvas, ctx, width, height, opts) {
        this.canvas = canvas;
        this.w = width;
        this.h = height;
        this.ctx = ctx;
        this.options = opts || {};
        this.timer = null;
        this._init();
    }

    _init() {}

    _draw() {}

    run() {
        let _that = this;
        this.status = 'run';
        _that.timer = setInterval(function () {
            _that._draw();
        }, 20)
    }

    stop() {
        let ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);
        this.status = 'stop';
        clearInterval(this.timer);
    }
}
class Rain extends canvasEffect{
    _init() {
        let amount = this.options.amount || 100;
        let speedFactor = this.options.speedFactor || 0.03;
        let speed = speedFactor * this.h;
        let status = this.options.status || "stop";
        let ps = (this.particles = []);
        for (let i = 0; i < amount; i++) {
            let particle = {
                x: Math.random() * this.w,
                y: Math.random() * this.h,
                len: Math.random()+1,//设定最小值1，放置随机长度太小
                xstep: -1,
                ystep: (speed-5) * Math.random()+5,//设定最小值5，放置随机速度太小
                color: 'rgba(255, 255, 255, 0.5)'
            };
            ps.push(particle);
        }
    }
    _draw() {
        let ps = this.particles;
        let ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);
        for (var i = 0; i < ps.length; i++) {
            let ele = ps[i];
            ctx.beginPath();
            // ctx.arc(ele.x, ele.y, 2, 0, 2 * Math.PI, true);
            // ctx.fillStyle='#EEEEEE';
            // ctx.fill();
            ctx.moveTo(ele.x, ele.y);
            ctx.lineTo(ele.x + ele.len * ele.xstep, ele.y + ele.len * ele.ystep);
            ctx.strokeStyle = ele.color;
            ctx.stroke();

            // 重新计算位置，为下次绘制准备
            ele.x += ele.xstep;
            ele.y += ele.ystep;
            if (ele.x <= 0 || ele.y >= this.h) {
                ele.x = Math.random() * this.w;
                ele.y = -10;
            }
        }
        // ctx.draw();


    }
}
class Snow extends canvasEffect{
    _init() {
        let amount = this.options.amount || 100;
        let colors = this.options.colors || ['#ccc', '#eee', '#fff', '#ddd'];
        let speedFactor = this.options.speedFactor || 0.03;
        let speed = speedFactor * this.h*0.15;
        let radius = this.options.radius || 2;
        let status = this.options.status || "stop";
        let ps = (this.particles = []);
        for (let i = 0; i < amount; i++) {
            let x=Math.random() * this.w;
            let y=Math.random() * this.h;
            let particle = {
                x,//实时位置
                y,
                ox:x,//x轴原始位置
                rs:Math.random()*180,//用于雪花摆动cos函数
                r: Math.floor(Math.random() * (radius + 0.5) + 0.5),//雪花半径
                ystep: speed * Math.random(),//y轴速度
                color: colors[Math.floor(Math.random() * colors.length)]//随机雪花颜色

            };
            ps.push(particle);
        }
    }
    _draw() {
        let ps = this.particles;
        let ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);
        for (var i = 0; i < ps.length; i++) {
            let ele=ps[i];
            let {x, y, r, color} = ele;
            ctx.beginPath();
            // 绘制下雪的效果
            ctx.fillStyle=color;
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.fill();


            // 重新计算位置，为下次绘制准备
            ele.rs+=(this.options.speedFactor/10);
            ele.x +=  Math.cos(2*Math.PI*ele.rs/360);
            ele.y += ele.ystep;
            if (ele.x > this.w || ele.y >= this.h) {
                ele.x = Math.random() * this.w;
                ele.y = -10;
            }
        }
        // ctx.draw();


    }
}

export default (weatherType,ctx,width,height,opts)=>{
    switch(weatherType){
        case 'rain':
            return new Rain(weatherType,ctx,width,height,opts);
        case 'snow':
            return new Snow(weatherType,ctx,width,height,opts);
    }
}


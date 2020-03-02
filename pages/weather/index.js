import {
    getMood,
    getHFWeather,
    getHFAir,
    transGcjLocationToName
} from '../../lib/api';
import {$} from '../../lib/utils';
import * as echarts from "../../components/ec-canvas/echarts"
import canvasEffect from '../../lib/canvasEffect'

let weatherEffect,canvasParam={};
Page({
    data: {
        logs: [],
        ec: {
            lazyLoad: true,
        },
        backgroundImage: '../../images/bg/day/cloud.jpg',
        backgroundColor: '#62aadc',
        authSetting:false,
        address: "定位中..",
        paddingTop: '64rpx',
        tips: "光芒透过云缝，洒向大地～",
        air: {
            "aqi": "77",
            "color": "#00cf9a",
            "name": "良"
        },
        current: {
            "temp": "35",
            "wind": "南风",
            "windLevel": "1",
            "weather": "多云",
            "humidity": "73",
        },
        currentIcon: "duoyunbai",
        today: {
            "temp": "24/30°",
            "icon": "leizhenyu",
            "weather": "雷阵雨"
        },
        tomorrow: {
            "temp": "24/30°",
            "icon": "leizhenyu",
            "weather": "雷阵雨"
        },
        // 24小时天气数据
        "hourlyData": [],
        //一周天气
        "weeklyData": [],
        //生活指数
        "lifeStyle": [],
        "oneWord": "",
    },
    onLoad() {
        wx.getSystemInfo({
            success: (res) => {
                // 状态栏高度和屏幕宽度
                this.setData({
                    // width,
                    dpr: res.pixelRatio,
                    paddingTop: res.statusBarHeight + 12
                });
            }
        });
        this.updateLocation();
        this.initChart();
    },
    //下拉刷新
    onPullDownRefresh() {
        this.updateLocation();
        wx.stopPullDownRefresh();
    },
    //分享
    onShareAppMessage() {
        return {
            title: '我发现一个好玩的天气小程序，分享给你看看！',
            path: '/pages/weather/index'
        }
    },
    // 自动获取地理位置获取经纬度
    updateLocation() {
        wx.showLoading({
            title: '定位中..',
            mask: false
        });
        wx.getLocation({
            type: 'gcj02',
            success: (res0) => {
                wx.hideLoading();
                let {latitude: lat, longitude: lon} = res0;
                this.getWeather(lat, lon);
                transGcjLocationToName(lat, lon).then(res1 => {
                    this.setData({
                        address: res1.data.result.address,
                        authSetting:false//手动授权后下拉刷新隐藏遮罩层
                    });
                    const {province, city, nation} = res1.data.result.ad_info;
                    //空气质量
                    this.getAir(city);
                    // 心情
                    return getMood(province, city, nation);
                }).then(mood=>{
                    this.setData({
                        tips: mood,
                    });
                });
            },
            fail: (e) => {
                wx.hideLoading();
                wx.getSetting({
                   success:res=>{
                       let authSetting=false;
                       if(!res.authSetting['scope.userLocation']){
                           authSetting=true;
                           wx.showToast({
                               title: '需要开启位置权限',
                               icon: 'none',
                               duration: 3000
                           });
                       }else{
                           wx.showToast({
                               title: '定位失败',
                               icon: 'none',
                               duration: 3000
                           });
                       }
                       this.setData({
                           address: '北京市海淀区西二旗北路',
                           authSetting:authSetting
                       });
                   }
                });
            }
        })
    },
    // 手动更新地理位置获取经纬度
    chooseLocation() {
        wx.chooseLocation({
            success: (res0) => {
                let {latitude: lat, longitude: lon, name: address} = res0;
                this.getWeather(lat, lon);
                this.setData({
                    address: address
                });
                transGcjLocationToName(lat, lon).then(res1 => {
                    const {province, city, nation} = res1.data.result.ad_info;
                    //空气质量
                    this.getAir(city);
                    return getMood(province, city, nation);
                }).then(mood=>{
                    this.setData({
                        tips: mood
                    });
                });

            }
        })
    },
    // 获取天气信息
    getWeather(lat, lon) {
        // 实时天气
        let now = getHFWeather(lat, lon, "now").then((res) => {
            this.setData({
                current: {
                    "temp": res.data.HeWeather6[0].now.tmp,
                    "wind": res.data.HeWeather6[0].now.wind_dir,
                    "windLevel": res.data.HeWeather6[0].now.wind_sc,
                    "weather": res.data.HeWeather6[0].now.cond_txt,
                    "humidity": res.data.HeWeather6[0].now.hum,
                }
            });
            let code = parseInt(res.data.HeWeather6[0].now.cond_code);
            this.doCanvasEffect(code);//绘制天气canvas背景
            return res;
        });
        // 预报
        let forecast = getHFWeather(lat, lon, "forecast").then((res) => {
            let cur = res.data.HeWeather6[0].daily_forecast;
            let weeks = [];
            let weeksTmp = [[], []];
            cur.forEach((info) => {
                weeks.push({
                    "day": info.cond_txt_d,
                    "dayIcon": $.getIconNameByCode(info.cond_code_d, false),
                    "dayWind": info.wind_dir,
                    "dayWindLevel": info.wind_sc,
                    "maxTemp": info.tmp_max,
                    "minTemp": info.tmp_min,
                    "night": info.cond_txt_n,
                    "nightIcon": $.getIconNameByCode(info.cond_code_d, true),
                    "time": info.date
                });
                weeksTmp[0].push(info.tmp_max);
                weeksTmp[1].push(info.tmp_min);
            });
            this.setData({
                today: {
                    "temp": cur[0].tmp_min + "/" + cur[0].tmp_max + "°",
                    "icon": $.getIconNameByCode(cur[0].cond_code_d, false),
                    "weather": cur[0].cond_txt_d
                },
                tomorrow: {
                    "temp": cur[1].tmp_min + "/" + cur[1].tmp_max + "°",
                    "icon": $.getIconNameByCode(cur[1].cond_code_d, false),
                    "weather": cur[1].cond_txt_d
                },
                weeklyData: weeks
            });
            this.chart.setOption($.getChartOption(weeksTmp));
            return res;
        });
        Promise.all([now, forecast]).then((res) => {
            let {sr, ss} = res[1].data.HeWeather6[0].daily_forecast[0];
            let {cond_code}=res[0].data.HeWeather6[0].now;
            let hours = new Date().getHours();
            let isNight=$.isNight(hours, sr, ss);
            let name=$.getWeatherName(cond_code);
            this.setData({
                currentIcon: $.getIconNameByCode(cond_code, isNight),
                backgroundColor:$.getBackgroundColor(name,isNight?'night':'day'),
                backgroundImage:$.getBackgroundImage(name,isNight?'night':'day')
            });
        }).catch((e) => {
            console.log(e);
        });
        //逐小时天气
        let hourly = getHFWeather(lat, lon, "hourly").then((res) => {
            let cur = res.data.HeWeather6[0].hourly;
            let hours = [];
            cur.forEach((info) => {
                hours.push({
                    "temp": info.tmp,
                    "time": info.time.slice(-5),
                    "weather": info.cond_txt,
                    "icon": $.getIconNameByCode(info.cond_code, false),
                })
            });
            this.setData({
                hourlyData: hours
            });
        });

        //生活指数
        let lifestyles = getHFWeather(lat, lon, "lifestyle").then((res) => {
            let cur = res.data.HeWeather6[0].lifestyle;
            this.setData({
                lifeStyle: $.setLifestyle(cur)
            });
        });
        //
        this.setData({
            oneWord: $.getOneWord()
        });

    },
    //获取空气质量信息
    getAir(city) {
        getHFAir(city, "now").then(res => {
            let cur = res.data.HeWeather6[0].air_now_city;
            let colors={
                '优':"#01E400",
                '良':"#FFFF01",
                '轻度污染':"#FFA400",
                '中度污染':"#FE0002",
                '重度污染':"#810081",
                '严重污染':"#7F0224",

            }
            this.setData({
                air: {
                    "aqi": cur.aqi,
                    "color": colors[cur.qlty],
                    "name": cur.qlty
                }
            });

        })
    },
    // 点击弹出生活详情
    lifeStyleDetail(e) {
        const {name, detail} = e.currentTarget.dataset;
        wx.showModal({
            title: name,
            content: detail,
            showCancel: false
        })
    },
    // 初始化表
    initChart() {
        let chartCanvas = this.selectComponent('#chart');
        chartCanvas.init((canvas, width, height) => {
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            chart.setOption($.getChartOption());
            this.chart = chart;
            return chart;
        });
    },
    // canvas雨雪背景
    doCanvasEffect(weatherCode) {
        //根据天气状态编码判断雨雪天气，绘制对应canvas
        let weatherInfo;
        if (weatherCode >= 300 && weatherCode < 500) {
            if (!weatherEffect) {
                let dpr = this.data.dpr;
                const query = wx.createSelectorQuery();
                query.select('#effect').fields({node: true, size: true}).exec((res)=>{
                    canvasParam.domWidth=res[0].node._width;
                    canvasParam.domHeight=res[0].node._height;
                    canvasParam.canvas = res[0].node;
                    canvasParam.ctx = canvasParam['canvas'].getContext('2d');
                    canvasParam['canvas'].width = canvasParam['domWidth'] * dpr;
                    canvasParam['canvas'].height = canvasParam['domHeight'] * dpr;
                    canvasParam['ctx'].scale(dpr, dpr);
                    weatherInfo =$.getEffectSettings(weatherCode);
                    weatherEffect = canvasEffect(weatherInfo.name, canvasParam['ctx'], canvasParam['domWidth'],canvasParam['domHeight'], {
                        amount: weatherInfo.amount||200,
                        speedFactor: 0.03,
                    });
                    weatherEffect.run();
                })
            }
            else{
                weatherEffect.stop();
                weatherEffect = null;
                weatherInfo =$.getEffectSettings(weatherCode);
                weatherEffect = canvasEffect(weatherInfo.name, canvasParam['ctx'], canvasParam['domWidth'],canvasParam['domHeight'], {
                    amount: weatherInfo.amount||200,
                    speedFactor: 0.03,
                });
                weatherEffect.run();
            }
        }else {
            weatherEffect?weatherEffect.stop():0;
        }



    },
    // doCanvasEffect(weatherCode) {
    //     //根据天气状态编码判断雨雪天气，绘制对应canvas
    //     let dpr = this.data.dpr;
    //     if (weatherEffect) {
    //         weatherEffect.stop();
    //     }
    //     weatherEffect = null;
    //     let weatherInfo;
    //     if (weatherCode >= 300 && weatherCode < 500) {
    //         weatherInfo =$.getEffectSettings(weatherCode);
    //     }else {
    //         return;
    //     }
    //     const query = wx.createSelectorQuery();
    //     query.select('#effect').fields({node: true, size: true}).exec((res)=>{
    //         let canvas = res[0].node;
    //         let ctx = canvas.getContext('2d');
    //         canvas.width = res[0].node._width * dpr;
    //         canvas.height = res[0].node._height * dpr;
    //         ctx.scale(dpr, dpr);
    //         weatherEffect = canvasEffect(weatherInfo.name, ctx, res[0].node._width, res[0].node._height, {
    //             amount: weatherInfo.amount||200,
    //             speedFactor: 0.03,
    //         });
    //         weatherEffect.run();
    //     })
    // },
    openSetting(){
        wx.openSetting({});
    }

})

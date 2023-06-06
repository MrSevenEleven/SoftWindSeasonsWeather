import {
  getMood,
  getHFWeather,
  getHFAir,
  transGcjLocationToName,
  getHFLifeStyle,
} from "../../lib/api";
import { $ } from "../../lib/utils";
import * as echarts from "../../components/ec-canvas/echarts";
import canvasEffect from "../../lib/canvasEffect";
import moment from "moment";
let weatherEffect,
  canvasParam = {};
Page({
  data: {
    logs: [],
    ec: {
      lazyLoad: true,
    },
    backgroundImage: "../../images/bg/day/cloud.jpg",
    backgroundColor: "#62aadc",
    authSetting: false,
    address: "定位中..",
    paddingTop: "64rpx",
    tips: "光芒透过云缝，洒向大地～",
    air: {
      aqi: "77",
      color: "#00cf9a",
      name: "良",
    },
    current: {
      temp: "35",
      wind: "南风",
      windLevel: "1",
      weather: "多云",
      humidity: "73",
    },
    currentIcon: "duoyunbai",
    today: {
      temp: "24/30°",
      icon: "leizhenyu",
      weather: "雷阵雨",
    },
    tomorrow: {
      temp: "24/30°",
      icon: "leizhenyu",
      weather: "雷阵雨",
    },
    // 24小时天气数据
    hourlyData: [],
    //一周天气
    weeklyData: [],
    //生活指数
    lifeStyle: [],
    oneWord: "",
  },
  onLoad() {
    wx.getSystemInfo({
      success: (res) => {
        // 状态栏高度和屏幕宽度
        this.setData({
          // width,
          dpr: res.pixelRatio,
          paddingTop: res.statusBarHeight + 12,
        });
      },
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
      title: "我发现一个好玩的天气小程序，分享给你看看！",
      path: "/pages/weather/index",
    };
  },
  // 自动获取地理位置获取经纬度
  updateLocation() {
    wx.showLoading({
      title: "定位中..",
      mask: false,
    });
    wx.getLocation({
      type: "gcj02",
      success: (res0) => {
        wx.hideLoading();
        let { latitude: lat, longitude: lon } = res0;
        this.getWeather(lat, lon);
        transGcjLocationToName(lat, lon)
          .then((res1) => {
            this.setData({
              address: res1.data.result.address,
              authSetting: false, //手动授权后下拉刷新隐藏遮罩层
            });
            const { province, city, nation } = res1.data.result.ad_info;
            //空气质量
            this.getAir({ lat, lon });
            // 心情
            return getMood(province, city, nation);
          })
          .then((mood) => {
            this.setData({
              tips: mood,
            });
          });
      },
      fail: (e) => {
        wx.hideLoading();
        wx.getSetting({
          success: (res) => {
            let authSetting = false;
            if (!res.authSetting["scope.userLocation"]) {
              authSetting = true;
              wx.showToast({
                title: "需要开启位置权限",
                icon: "none",
                duration: 3000,
              });
            } else {
              wx.showToast({
                title: "定位失败",
                icon: "none",
                duration: 3000,
              });
            }
            this.setData({
              address: "北京市海淀区西二旗北路",
              authSetting: authSetting,
            });
          },
        });
      },
    });
  },
  // 手动更新地理位置获取经纬度
  chooseLocation() {
    wx.chooseLocation({
      success: (res0) => {
        let { latitude: lat, longitude: lon, name: address } = res0;
        this.getWeather(lat, lon);
        this.setData({
          address: address,
        });
        transGcjLocationToName(lat, lon)
          .then((res1) => {
            const { province, city, nation } = res1.data.result.ad_info;
            //空气质量
            this.getAir({ lat, lon });
            return getMood(province, city, nation);
          })
          .then((mood) => {
            this.setData({
              tips: mood,
            });
          });
      },
    });
  },
  // 获取天气信息
  getWeather(lat, lon) {
    // 实时天气
    let now = getHFWeather(lat, lon, "now").then((res) => {
      this.setData({
        current: {
          temp: res.data.now.temp,
          wind: res.data.now.windDir,
          windLevel: res.data.now.windScale,
          weather: res.data.now.text,
          humidity: res.data.now.humidity,
        },
      });
      let code = parseInt(res.data.now.icon);
      this.doCanvasEffect(code); //绘制天气canvas背景
      return res;
    });
    // 预报
    let forecast = getHFWeather(lat, lon, "7d").then((res) => {
      let cur = res.data.daily;
      let weeks = [];
      let weeksTmp = [[], []];
      cur.forEach((info) => {
        weeks.push({
          //   day: info.cond_txt_d,
          //   dayIcon: $.getIconNameByCode(info.cond_code_d, false),
          //   dayWind: info.wind_dir,
          //   dayWindLevel: info.wind_sc,
          //   maxTemp: info.tmp_max,
          //   minTemp: info.tmp_min,
          //   night: info.cond_txt_n,
          //   nightIcon: $.getIconNameByCode(info.cond_code_d, true),
          //   time: info.date,
          day: info.textDay,
          dayIcon: $.getIconNameByCode(info.iconDay, false),
          dayWind: info.windDirDay,
          dayWindLevel: info.windScaleDay,
          maxTemp: info.tempMax,
          minTemp: info.tempMin,
          night: info.textNight,
          nightIcon: $.getIconNameByCode(info.iconNight, true),
          time: info.fxDate,
        });
        weeksTmp[0].push(info.tempMax);
        weeksTmp[1].push(info.tempMin);
      });
      this.setData({
        today: {
          temp: cur[0].tempMin + "/" + cur[0].tempMax + "°",
          icon: $.getIconNameByCode(cur[0].iconDay, false),
          weather: cur[0].textDay,
        },
        tomorrow: {
          temp: cur[1].tempMin + "/" + cur[1].tempMax + "°",
          icon: $.getIconNameByCode(cur[1].iconDay, false),
          weather: cur[1].textDay,
        },
        weeklyData: weeks,
      });
      this.chart.setOption($.getChartOption(weeksTmp));
      return res;
    });
    Promise.all([now, forecast])
      .then((res) => {
        let { sunrise, sunset } = res[1].data.daily[0];
        let { icon } = res[0].data.now;
        let hours = new Date().getHours();
        let isNight = $.isNight(hours, sunrise, sunset);
        let name = $.getWeatherName(icon);
        this.setData({
          currentIcon: $.getIconNameByCode(icon, isNight),
          backgroundColor: $.getBackgroundColor(
            name,
            isNight ? "night" : "day"
          ),
          backgroundImage: $.getBackgroundImage(
            name,
            isNight ? "night" : "day"
          ),
        });
      })
      .catch((e) => {
        console.log(e);
      });
    //逐小时天气
    let hourly = getHFWeather(lat, lon, "24h").then((res) => {
      let cur = res.data.hourly;
      let hours = [];
      cur.forEach((info) => {
        hours.push({
          temp: info.temp,
          time: moment(info.fxTime).format("HH:mm"),
          weather: info.text,
          icon: $.getIconNameByCode(info.icon, false),
        });
      });
      this.setData({
        hourlyData: hours,
      });
    });

    //生活指数
    let lifestyles = getHFLifeStyle(lat, lon, "1d").then((res) => {
      let cur = res.data.daily;
      this.setData({
        lifeStyle: $.setLifestyle(cur),
      });
    });
    //
    this.setData({
      oneWord: $.getOneWord(),
    });
  },
  //获取空气质量信息
  getAir(location) {
    getHFAir(location, "now").then((res) => {
      let cur = res.data.now;
      let colors = {
        优: "#01E400",
        良: "#FFFF01",
        轻度污染: "#FFA400",
        中度污染: "#FE0002",
        重度污染: "#810081",
        严重污染: "#7F0224",
      };
      this.setData({
        air: {
          aqi: cur.aqi,
          color: colors[cur.category],
          name: cur.category,
        },
      });
    });
  },
  // 点击弹出生活详情
  lifeStyleDetail(e) {
    const { name, detail } = e.currentTarget.dataset;
    wx.showModal({
      title: name,
      content: detail,
      showCancel: false,
    });
  },
  // 初始化表
  initChart() {
    let chartCanvas = this.selectComponent("#chart");
    chartCanvas.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
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
        query
          .select("#effect")
          .fields({ node: true, size: true })
          .exec((res) => {
            canvasParam.domWidth = res[0].node._width;
            canvasParam.domHeight = res[0].node._height;
            canvasParam.canvas = res[0].node;
            canvasParam.ctx = canvasParam["canvas"].getContext("2d");
            canvasParam["canvas"].width = canvasParam["domWidth"] * dpr;
            canvasParam["canvas"].height = canvasParam["domHeight"] * dpr;
            canvasParam["ctx"].scale(dpr, dpr);
            weatherInfo = $.getEffectSettings(weatherCode);
            weatherEffect = canvasEffect(
              weatherInfo.name,
              canvasParam["ctx"],
              canvasParam["domWidth"],
              canvasParam["domHeight"],
              {
                amount: weatherInfo.amount || 200,
                speedFactor: 0.03,
              }
            );
            weatherEffect.run();
          });
      } else {
        weatherEffect.stop();
        weatherEffect = null;
        weatherInfo = $.getEffectSettings(weatherCode);
        weatherEffect = canvasEffect(
          weatherInfo.name,
          canvasParam["ctx"],
          canvasParam["domWidth"],
          canvasParam["domHeight"],
          {
            amount: weatherInfo.amount || 200,
            speedFactor: 0.03,
          }
        );
        weatherEffect.run();
      }
    } else {
      weatherEffect ? weatherEffect.stop() : 0;
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
  openSetting() {
    wx.openSetting({});
  },
});

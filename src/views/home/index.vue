<template>
  <div class="class">
    <div class="header"></div>
    <div class="wrap" id="wrap">
      <div class="wrapper">
        <div class="product_list" id="product_list">
          <div
            v-for="(banner, index) in bannerList"
            :key="index"
            :class="['product_box', banner.class, { show: index === 0 }]"
          >
            <div class="bg_box">
              <img :src="getImageUrl(banner.img)" />
            </div>
            <div class="content">
              <div class="main_box">
                <h2 class="hide_txt png">这里由文字改成图片显示</h2>
                <a class="btn_product" @click="router.push('/hello')"
                  >开启3D体验</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup name="home">
import $ from "jquery";

import { useRouter } from "vue-router";
const router = useRouter();

const getImageUrl = (name) => {
  return new URL(
    `../../assets/images/lambohini/bright/${name}`,
    import.meta.url
  ).href;
};

const bannerList = [
  {
    class: "shoulei",
    img: "Lamborghini-Centenario-08.jpg",
  },
  {
    class: "xnet",
    img: "Lamborghini-Centenario-02.jpg",
  },
  {
    class: "member",
    img: "Lamborghini-Centenario-03.jpg",
  },
  {
    class: "xav",
    img: "Lamborghini-Centenario-04.jpg",
  },
];

onMounted(() => {
  pageInit();
});
const pageInit = () => {
  let $wrap = $("#wrap"),
    $pages = $("#product_list").find(".product_box"),
    $footer = $("#footer"),
    $bgs = $pages.find(".bg_box img"),
    $mainBoxs = $pages.find(".main_box"),
    $rptBg = $("#rpt_bg");
  let data = {
    pLength: $pages.length,
    curP: 0,
    isCan: true,
    isOnbtn: false,
    fColor: [2, 2, 1, 1, 1],
    dur: 3500,
    cNum: 0,
  };
  let cId;
  let isCss3 = (function () {
    let style = document.createElement("div").style;
    for (let k in style) {
      if (k.toLowerCase().indexOf("animation") > 0) {
        return true;
      }
    }
    return false;
  })();
  let isIE6 = navigator.userAgent.indexOf("MSIE 6.0") > 0;
  //页面自缩放
  let resize = function () {
    let w = $(window).width(),
      h = $(window).height();
    $wrap.height(h);
    if (w / h < 1920 / 1080) {
      $bgs.height(h).css({
        width: "auto",
        margin: -0.5 * h + "px 0 0 " + ((-0.5 * 1920) / 1080) * h + "px",
      });
    } else {
      $bgs.width(w).css({
        height: "auto",
        margin: (-0.5 * w * 1080) / 1920 + "px 0 0 " + -0.5 * w + "px",
      });
    }
    let imgH = $bgs.height();
    $mainBoxs.height(imgH).css("margin-top", -0.5 * imgH + "px");
    let cls;
    if (isCss3 && document.getElementById("wrap")) {
      document.getElementById("wrap").className = "wrap big_view xbig";
      switch (true) {
        case w >= 1920: {
          cls = "";
          break;
        }
        case w < 1920 && w >= 1680: {
          cls = "small9";
          break;
        }
        case w < 1680 && w >= 1600: {
          cls = "small8";
          break;
        }
        case w < 1600 && w >= 1536: {
          cls = "small7";
          break;
        }
        case w < 1536 && w >= 1440: {
          cls = "small6";
          break;
        }
        case w < 1440 && w >= 1366: {
          cls = "small5";
          break;
        }
        case w < 1366 && w >= 1280: {
          cls = "small4";
          break;
        }
        case w < 1280 && w >= 1024: {
          cls = "small3";
          break;
        }
        case w < 1024: {
          cls = "small2";
          break;
        }
      }
      for (let i = 0; i < data.pLength; i++) {
        $pages
          .eq(i)
          .find(".content")
          .attr("class", "content " + cls);
      }
    } else {
      switch (true) {
        case w >= 1600: {
          cls = "big_view";
          break;
        }
        case w < 1600 && w >= 1440: {
          cls = "mid_view";
          break;
        }
        case w < 1440: {
          cls = "small_view";
          break;
        }
      }
      let ws = $wrap[0].className;
      if (
        isIE6 &&
        (ws.indexOf("big") != -1 ||
          ws.indexOf("mid") != -1 ||
          ws.indexOf("small") != -1) &&
        ws.indexOf(cls) == -1
      )
        location.reload();
      wrap.className = "wrap " + cls;
    }
  };
  $(window).resize(resize);
  resize();

  let pageChange = function (idx) {
    if (data.isOnbtn) return;
    if (idx >= -1 && idx < data.pLength && idx != data.curP && data.isCan) {
      data.isCan = false;
      data.cNum++;
      clearInterval(cId);
      idx = idx == -1 ? data.pLength - 1 : idx;
      $pages.eq(data.curP).css({ zIndex: 0 });
      $pages
        .eq(idx)
        .addClass("show")
        .css({ opacity: 0, zIndex: 1 })
        .animate({ opacity: 1 }, 400, function () {
          $pages.eq(data.curP).removeClass("show");
          $(this).addClass("show");
          data.isCan = true;
          data.curP = idx;
          data.cNum--;
          if (data.cNum == 0) {
            cId = setInterval(function () {
              pageChange((data.curP + 1) % data.pLength);
            }, data.dur);
          }
        });
    }
  };

  let isBottom = false;
  let bAni;
  let bottomHide = function () {
    if (isBottom) {
      isBottom = false;
      if (bAni) clearTimeout(bAni), (bAni = null);
      $footer.removeClass("show");
      $rptBg.removeClass("show");
    }
  };
  let bottomShow = function () {
    if (!isBottom) {
      isBottom = true;
      $footer.addClass("show");
      $rptBg.addClass("show");
      if (bAni) clearTimeout(bAni);
      bAni = setTimeout(bottomHide, 2000);
    }
  };
  $footer.on("mouseenter", function () {
    if (bAni) clearTimeout(bAni), (bAni = null);
  });
  $footer.on("mouseleave", function () {
    if (bAni) clearTimeout(bAni);
    bAni = setTimeout(bottomHide, 2000);
  });
  $(document).on("mousewheel DOMMouseScroll", function (event) {
    let sd = event.originalEvent.wheelDelta || event.originalEvent.detail * -1;
    if (sd > 0) {
      bottomHide();
    } else {
      bottomShow();
    }
  });
  cId = setInterval(function () {
    pageChange((data.curP + 1) % data.pLength);
  }, data.dur);
};
</script>

<style scoped lang="less">
.footer {
  position: relative;
  width: 100%;
  bottom: 0;
  left: 0;
  z-index: 99;
  text-align: center;
}
.footer .opc_bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  _height: 91px;
}
.footer .foot {
  line-height: 20px;
  position: relative;
  margin: 0 auto;
  color: #b2b2b2;
  padding: 3px 0 6px;
}
.footer .links a {
  color: #b2b2b2;
}
.footer .safe_links {
  font-size: 0;
  line-height: 0;
  margin-top: 5px;
}
.footer .safe_links a {
  display: inline-block;
  // +display: inline;

  color: #999;
  position: relative;
  width: 67px;
  font-size: 12px;
  line-height: 14px;
  height: 28px;
  padding: 5px 0 5px 40px;
  border: 1px solid #808080;
  position: relative;

  margin: 0 7px;
}
.footer .safe_links a img {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 38px;
}

.footer .follow_box {
  padding-top: 45px;
  text-align: center;
}
.footer .txt_follow {
  font-size: 16px;
  color: #ffffff;
  line-height: 24px;
}
.footer .follow_list {
  font-size: 0;
  line-height: 0;
  margin-top: 18px;
  text-align: center;
}
.footer .follow_list a {
  display: inline-block;
  // +display: inline;

  width: 50px;
  height: 51px;
  background-image: url("@/assets/images/home/follow_spr.png");
  margin: 0 10px;
  position: relative;
}
.footer .follow_list .code_box {
  position: absolute;
  width: 110px;
  height: 110px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  left: -9999px;
  margin-left: -65px;
  bottom: 70px;
  opacity: 0;
  transition: opacity 0.2s;
  -webkit-transition: opacity 0.2s;
}
.footer .follow_list a:hover .code_box {
  left: 50%;
  opacity: 1;
}
.footer .follow_list .code_box .ic_arr {
  font-size: 0;
  line-height: 0;
  position: absolute;
  width: 0;
  height: 0;
  border-width: 8px;
  border-style: solid dashed dashed dashed;
  border-color: #fff transparent transparent transparent;
  left: 50%;
  margin-left: -8px;
  top: 100%;
}
.footer .follow_list .code_box img {
  display: block;
  height: 100%;
  height: 100%;
}
.footer .follow_list .wechat {
  background-position: 0 0;
}
.footer .follow_list .wechat:hover {
  background-position: 0 -72px;
}
.footer .follow_list .sina {
  background-position: -70px 0;
}
.footer .follow_list .sina:hover {
  background-position: -70px -72px;
}
.footer .follow_list .forum {
  background-position: -140px 0;
}
.footer .follow_list .forum:hover {
  background-position: -140px -72px;
}
.footer .follow_list .post {
  background-position: -210px 0;
}
.footer .follow_list .post:hover {
  background-position: -210px -72px;
}
.footer .main_links a {
  font-size: 18px;
  color: #fff;
  margin: 0 15px;
}

/*.f_color1 .foot,.f_color1 .links a{color:#d9d9d9;}
.f_color2 .foot,.f_color2 .links a{color:#262626;}*/

@keyframes bounceInRight {
  0% {
    opacity: 0;
    transform: translateX(2000px);
  }
  60% {
    opacity: 1;
    transform: translateX(-30px);
  }
  80% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}
@-webkit-keyframes bounceInRight {
  0% {
    opacity: 0;
    -webkit-transform: translateX(2000px);
  }
  60% {
    opacity: 1;
    -webkit-transform: translateX(-30px);
  }
  80% {
    -webkit-transform: translateX(10px);
  }
  100% {
    -webkit-transform: translateX(0);
  }
}

// all
.hide_txt {
  text-indent: -9999em;
  font-size: 0;
  line-height: 0;
}
.clearfix:after {
  display: block;
  content: "";
  visibility: hidden;
  clear: both;
  height: 0;
}
.clearfix {
  zoom: 1;
}

.footer {
  position: absolute;
  bottom: -91px;
  left: 0;
  transition: bottom 0.3s;
  -webkit-transition: bottom 0.3s;
  z-index: 8;
}
.footer.show {
  bottom: 0;
}

.wrap {
  height: 100%;
  position: relative;
  overflow: hidden;
}
.wrapper {
  height: 100%;
  position: relative;
  overflow: hidden;
}
.content {
  position: relative;
  width: 1200px;
  margin: 0 auto;
}

.small2 {
  transform: scale(0.6, 0.6);
  -webkit-transform: scale(0.6, 0.6);
}
.small3 {
  transform: scale(0.65, 0.65);
  -webkit-transform: scale(0.65, 0.65);
}
.small4 {
  transform: scale(0.7, 0.7);
  -webkit-transform: scale(0.7, 0.7);
}
.small5 {
  transform: scale(0.75, 0.75);
  -webkit-transform: scale(0.75, 0.75);
}
.small6 {
  transform: scale(0.8, 0.8);
  -webkit-transform: scale(0.8, 0.8);
}
.small7 {
  transform: scale(0.85, 0.85);
  -webkit-transform: scale(0.85, 0.85);
}
.small8 {
  transform: scale(0.9, 0.9);
  -webkit-transform: scale(0.9, 0.9);
}
.small9 {
  transform: scale(0.95, 0.95);
  -webkit-transform: scale(0.95, 0.95);
}

.product_list {
  position: relative;
  height: 100%;
}
.product_box {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: -9999px;
}
.bg_box {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-position: center center;
  background-repeat: no-repeat;
}
.bg_main {
  width: 1000px;
  height: 100%;
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -500px;
  background-position: center center;
  background-repeat: no-repeat;
}
.bg_box img {
  position: absolute;
  top: 50%;
  left: 50%;
}

.product_box .content {
  width: 1000px;
  height: 100%;
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -500px;
  z-index: 5;
  transform-origin: center center;
  -webkit-transform-origin: center center;
}
.product_box .main_box {
  position: relative;
  height: 100%;
  left: -9999px;
  top: 50%;
}
.product_list .show {
  left: 0;
}
.product_list .show .main_box {
  left: 0;
}
.product_box h2 {
  position: absolute;
  top: 50%;
  left: 50%;
  background-size: 100% 100%;
}
.product_box h2 span {
  position: absolute;
}
.btn_product {
  font-size: 18px;
  padding: 8px 12px;
  position: fixed;
  transform: translate(-50%, 85%);
  top: 85%;
  left: 50%;
  color: #ffffff;
  text-align: center;
  border-width: 1px;
  border-style: solid;
}
.btn_product:hover {
  text-decoration: none;
  transform: translate(-50%, 85%) scale(1.02);
  -webkit-transform: translate(-50%, 85%) scale(1.02);
}
.product_box.show h2 {
  animation: tt_effect 0.6s 0.3s linear both;
  -webkit-animation: tt_effect 0.6s 0.3s linear both;
}

.rpt_bg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 238px;
  background: url("@/assets/images/home/rpt_bg.png") repeat-x;
  opacity: 0;
  transition: opacity 0.3s;
  -webkit-transition: opacity 0.3s;
  z-index: 5;
  left: -9999px;
}
.rpt_bg.show {
  opacity: 1;
  left: 0;
}

/*big size*/

.big_view .shoulei h2 {
  width: 900px;
  height: 140px;
  margin: -360px 0 0 -415px;
  background-image: url("@/assets/images/home/ic_l/Lamborghini-Centenario01.png");
}
.big_view.xbig .shoulei h2 {
  background-image: url("@/assets/images/home/ic_xl/Lamborghini-Centenario01.png");
}

.big_view .xnet h2 {
  width: 250px;
  height: 277px;
  margin: -393px 0 0 -265px;
  background-image: url("@/assets/images/home/ic_l/Lamborghini-Centenario02.png");
}
.big_view.xbig .xnet h2 {
  background-image: url("@/assets/images/home/ic_xl/Lamborghini-Centenario02.png");
}

.big_view .member h2 {
  width: 750px;
  height: 204px;
  margin: -400px 0 0 -350px;
  background-image: url("@/assets/images/home/ic_l/Lamborghini-Centenario03.png");
}
.big_view.xbig .member h2 {
  background-image: url("@/assets/images/home/ic_xl/Lamborghini-Centenario03.png");
}

.big_view .xav h2 {
  width: 780px;
  height: 200px;
  margin: -360px 0 0 -154px;
  background-image: url("@/assets/images/home/ic_l/Lamborghini-Centenario04.png");
}
.big_view.xbig .xav h2 {
  background-image: url("@/assets/images/home/ic_xl/Lamborghini-Centenario04.png");
}

.big_view .ic_xkn {
  background-position: -318px 0;
  width: 55px;
  margin-left: -27px;
}
.big_view a:hover .ic_xkn,
.big_view a.cur .ic_xkn {
  background-position: -318px -108px;
}
.big_view .ic_ipr {
  background-position: -522px 0;
  width: 39px;
  margin-left: -20px;
}
.big_view a:hover .ic_ipr,
.big_view a.cur .ic_ipr {
  background-position: -522px -108px;
}

/*mid size*/

.mid_view .shoulei h2 {
  width: 345px;
  height: 78px;
  margin: -286px 0 0 -173px;
  background-image: url("@/assets/images/home/ic_m/Lamborghini-Centenario01.png");
}

.mid_view .xnet h2 {
  width: 55px;
  height: 318px;
  margin: -211px 0 0 -27px;
  background-image: url("@/assets/images/home/ic_m/Lamborghini-Centenario02.png");
}

.mid_view .member h2 {
  width: 371px;
  height: 59px;
  margin: -230px 0 0 -185px;
  background-image: url("@/assets/images/home/ic_m/Lamborghini-Centenario03.png");
}
.mid_view .xkn h2 {
  width: 483px;
  height: 50px;
  margin: -220px 0 0 -241px;
  background-image: url("@/assets/images/home/ic_m/Lamborghini-Centenario04.png");
}

.mid_view .xav h2 {
  width: 406px;
  height: 44px;
  margin: -288px 0 0 -203px;
  background-image: url("@/assets/images/home/ic_m/Lamborghini-Centenario04.png");
}

/*small size*/

.small_view .shoulei h2 {
  width: 276px;
  height: 62px;
  margin: -229px 0 0 -138px;
  background-image: url("@/assets/images/home/ic_s/Lamborghini-Centenario01.png");
}

.small_view .xnet h2 {
  width: 44px;
  height: 254px;
  margin: -169px 0 0 -22px;
  background-image: url("@/assets/images/home/ic_s/Lamborghini-Centenario02.png");
}

.small_view .member h2 {
  width: 297px;
  height: 47px;
  margin: -184px 0 0 -148px;
  background-image: url("@/assets/images/home/ic_s/Lamborghini-Centenario03.png");
}

.small_view .xkn h2 {
  width: 386px;
  height: 40px;
  margin: -176px 0 0 -193px;
  background-image: url("@/assets/images/home/ic_s/Lamborghini-Centenario04.png");
}

.small_view .xav h2 {
  width: 325px;
  height: 35px;
  margin: -230px 0 0 -162px;
  background-image: url("@/assets/images/home/ic_s/Lamborghini-Centenario04.png");
}

.small_view .ic_xkn {
  background-position: -203px 0;
  width: 36px;
  margin-left: -18px;
}
.small_view a:hover .ic_xkn,
.small_view a.cur .ic_xkn {
  background-position: -203px -69px;
}
.small_view .ic_ipr {
  background-position: -334px 0;
  width: 27px;
  margin-left: -14px;
}
.small_view a:hover .ic_ipr,
.small_view a.cur .ic_ipr {
  background-position: -334px -69px;
}

/*news sec*/
.news_sec {
  background: #f8f8f8;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}
.news_sec .wrap,
.news_sec .wrapper {
  height: auto;
}

.news_sec .banner_box {
  height: 536px;
  position: relative;
}
.news_sec .banner_list {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
}
.news_sec .banner_list li,
.news_sec .banner_list li a {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.news_sec .banner_list li img {
  position: absolute;
  height: 100%;
  top: 0;
  left: 50%;
  margin-left: -960px;
}
.news_sec .banner_btns {
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 40px;
  font-size: 0;
  line-height: 0;
  text-align: center;
}
.news_sec .banner_btns a {
  display: inline-block;
  // +display: inline;

  background: url("@/assets/images/home/news_spr.png") no-repeat -112px 0;
  width: 10px;
  height: 10px;
  margin: 0 10px;
}
.news_sec .banner_btns a.cur,
.news_sec .banner_btns a:hover {
  background-position: -90px 0;
}
.news_sec .banner_box .btn_prev,
.news_sec .banner_box .btn_next {
  position: absolute;
  width: 60px;
  height: 92px;
  top: 50%;
  margin-top: -46px;
  z-index: 5;
  transition: none;
  -webkit-transition: none;
}
.news_sec .banner_box .btn_prev:hover,
.news_sec .banner_box .btn_next:hover {
  background: #000;
  filter: alpha(opacity=50);
  opacity: 0.5;
}
.news_sec .banner_box .ic_arr {
  position: absolute;
  cursor: pointer;
  width: 19px;
  height: 51px;
  top: 20px;
  left: 20px;
  background-image: url("@/assets/images/home/news_spr.png");
}
.news_sec .banner_box .btn_prev {
  left: 120px;
}
.news_sec .banner_box .btn_prev .ic_arr {
  background-position: 0 0;
}
.news_sec .banner_box .btn_next {
  right: 120px;
}
.news_sec .banner_box .btn_next .ic_arr {
  background-position: -50px 0;
}

.news_wp {
  padding-top: 30px;
}
.news_feed {
  width: 1000px;
  padding: 24px 99px;
  border: 1px solid #fcfcfc;
  background: #fcfcfc;
  margin-bottom: 30px;
}
.news_feed:hover {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
  // +border-color: #ccc;
}
.news_feed .news_tt h2 {
  font-size: 24px;
  color: #000;
  line-height: 40px;
}
.news_feed .news_tt h2 a {
  display: block;
  position: relative;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #000;
}
.news_sec .txt_brief {
  margin-top: 2px;
  line-height: 28px;
  color: #a4a4a4;
}
.news_sec .txt_brief span {
  float: left;
}
.news_sec .txt_type {
  padding: 0 8px;
  border-radius: 3px;
  font-size: 16px;
  color: #fff;
  margin-right: 18px;
  display: block;
}
.news_sec .txt_brief .orange {
  background: #e9614d;
}
.news_sec .txt_brief .blue {
  background: #3ea5fa;
}
.news_sec .txt_brief .yellow {
  background: #ff8d37;
}
.news_sec .txt_brief .green {
  background: #62bc41;
}
.news_sec .txt_time {
  font-size: 16px;
  margin-right: 14px;
}
.news_feed .txt_read {
  position: relative;

  padding-left: 25px;
  font-size: 14px;
}
.news_feed .ic_read {
  position: absolute;
  top: 50%;
  left: 0;
  background: url("@/assets/images/home/news_spr.png") no-repeat -80px -32px;
  width: 21px;
  height: 12px;
  margin-top: -6px;
}
.news_feed .news_cont {
  margin: 8px 0;
}
.news_feed .news_cont img {
  display: block;
  width: 100%;
}
.news_feed .txt_news {
  font-size: 18px;
  line-height: 30px;
  color: #a4a4a4;
}
.news_feed .btn_read {
  float: right;
  font-size: 16px;
  line-height: 20px;
  color: #2aa3e9;
}

.news_sec .loading_box {
  width: 1000px;
  padding: 24px 99px;
  border: 1px solid #fcfcfc;
  background: #fcfcfc;
  font-size: 0;
  line-height: 0;
  text-align: center;
}
.news_sec .loading_box .txt_load {
  color: #999;
  font-size: 20px;
  line-height: 26px;
  position: relative;
  display: inline-block;
  // +display: inline;

  padding-left: 32px;
}
.news_sec .loading_box .ic_load {
  position: absolute;
  top: 0;
  left: 0;
  background: url("@/assets/images/home/news_spr.png") no-repeat -106px -24px;
  width: 23px;
  height: 26px;
}

.news_detail_sec .content {
  padding-top: 130px;
}
.news_sec .news_detail_wp:hover {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
}
.news_sec .news_detail_cont {
  width: 1000px;
  padding: 0 99px 30px;
  background: #fcfcfc;
  border: 1px solid #f0f0f0;
  border-top: 0;
}
.news_sec .detail_tt {
  padding-top: 60px;
}
.news_sec .detail_tt h2 {
  font-size: 26px;
  line-height: 34px;
  color: #000;
}
.news_sec .detail_msg {
  position: relative;
  margin-top: 6px;
  height: 32px;
}
.news_sec .action_box {
  position: absolute;
  top: 0;
  right: 0;
  padding-right: 120px;
}
.news_sec .num_box a {
  float: left;
  font-size: 14px;
  color: #a4a4a4;
  line-height: 32px;
  position: relative;

  padding-left: 28px;
  margin-right: 5px;
}
.news_sec .num_box .btn_read {
  cursor: default;
}
.news_sec .num_box .btn_read:hover {
  text-decoration: none;
}
.news_sec .news_detail_cont .ic_read {
  position: absolute;
  background: url("@/assets/images/home/news_spr.png") no-repeat -4px -58px;
  width: 28px;
  height: 16px;
  top: 8px;
  left: 0;
  cursor: default;
}
.news_sec .news_detail_cont .ic_love {
  position: absolute;
  background: url("@/assets/images/home/news_spr.png") no-repeat -40px -58px;
  width: 22px;
  height: 19px;
  top: 6px;
  left: 0;
}
.news_sec .news_detail_cont .love {
  background-position: -70px -58px;
}
.news_sec .news_detail_cont .share_box {
  position: absolute;
  top: 0;
  right: 0;
}
.news_sec .news_detail_cont .share_box a {
  position: relative;
  float: left;
  width: 32px;
  height: 32px;
  background-image: url("@/assets/images/home/news_spr.png");
  margin-left: 10px;
}
.news_sec .news_detail_cont a.wechat {
  background-position: -4px -80px;
}
.news_sec .news_detail_cont a.sina {
  background-position: -46px -80px;
}
.news_sec .news_detail_cont a.qzone {
  background-position: -88px -80px;
}
.news_detail_cont .share_box .code_box {
  position: absolute;
  width: 110px;
  height: 110px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  left: -9999px;
  margin-left: -65px;
  bottom: 40px;
  opacity: 0;
  transition: opacity 0.2s;
  -webkit-transition: opacity 0.2s;
}
.news_detail_cont .share_box a:hover .code_box {
  left: 50%;
  opacity: 1;
}
.news_detail_cont .share_box .code_box .ic_arr {
  font-size: 0;
  line-height: 0;
  position: absolute;
  width: 0;
  height: 0;
  border-width: 8px;
  border-style: solid dashed dashed dashed;
  border-color: #fff transparent transparent transparent;
  left: 50%;
  margin-left: -8px;
  top: 100%;
}
.news_detail_cont .share_box .code_box img {
  display: block;
  height: 100%;
  height: 100%;
}
.news_sec .detail_cont {
  padding-top: 30px;
}
.news_sec .detail_cont img {
  display: block;
  margin: 8px 0;
}
.news_sec .detail_cont .txt_detail {
  font-size: 16px;
  line-height: 30px;
  text-indent: 32px;
  color: #5b5b5b;
}
.news_sec .detail_cont .txt_stitle {
  font-size: 18px;
  line-height: 32px;
  color: #000;
  margin-top: 10px;
}

.news_sec .news_catalog {
  width: 1000px;
  padding: 30px 99px;
  background: #fcfcfc;
  border: 1px solid #f0f0f0;
  border-top: 0;
  border-bottom-width: 3px;
}
.news_sec .news_catalog a {
  font-size: 18px;
  color: #a4a4a4;
  line-height: 28px;
}
.news_sec .news_catalog a:hover {
  text-decoration: none;
  color: #2aa3e9;
}

.news_sec .btn_totop {
  position: fixed;
  bottom: 50px;
  _position: absolute;
  _bottom: 20px;
  right: 40px;
  background: url("@/assets/images/home/news_spr.png") no-repeat -136px -2px;
  width: 46px;
  height: 45px;
  z-index: 10;
}
.news_sec .btn_totop:hover {
  background-position: -136px -52px;
}

.news_sec .header {
  position: absolute;
}
.news_sec .header .head {
  width: 1200px;
  margin: 0 auto;
}
.news_sec .footer {
  background: #9a9d9d;
  position: relative;
  padding-bottom: 15px;
}
.news_sec .footer .main_links {
  padding: 50px 0 25px;
}
.news_sec .footer .foot,
.news_sec .footer .links a {
  color: #f6f6f6;
}
.news_sec .header .news_nav .ic_bg {
  background: #000;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: alpha(opacity=50);
  opacity: 0.5;
}
.news_sec .header .news_nav .ic_arr {
  display: none;
}
.news_sec .header .news_nav ul {
  background: none;
  border: 0;
}
.news_sec .header .news_nav a {
  color: #bbb;
}
.news_sec .header .news_nav a:hover {
  color: #fff;
}

.news_detail_sec .header {
  position: fixed;
}
.news_detail_sec .header {
  background: #1c9fe8;
}
.news_detail_sec .header .news_nav {
  background: none;
}
.news_detail_sec .header .news_nav .ic_arr {
  display: block;
}
.news_detail_sec .header .news_nav ul {
  background: #fff;
  border: 1px solid #f1f1f1;
}
.news_detail_sec .header .news_nav a {
  color: #909090;
}
.news_detail_sec .header .news_nav a:hover {
  color: #575a5e;
}
.news_detail_sec .header .news_nav .ic_bg {
  display: none;
}
.news_detail_sec .header .news_nav ul {
  transform-origin: center top;
  -webkit-transform-origin: center top;
  transform: scale(0);
  -webkit-transform: scale(0);
  transition: transform 0.3s;
  -webkit-transition: transform 0.3s;
}
.news_detail_sec .header .news_on ul {
  transform: scale(1);
  -webkit-transform: scale(1);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}
/*news sec end*/

// 背景图片动画
.product_box.show .bg_box {
  animation: bg_effect 2.5s 0.3s linear both;
  -webkit-animation: bg_effect 3.4s 0.3s linear both;
}

@keyframes opacity {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@-webkit-keyframes opacity {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes tt_effect {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
@-webkit-keyframes tt_effect {
  0% {
    -webkit-transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bg_effect {
  0% {
    transform: scale(1, 1);
  }
  100% {
    transform: scale(1.05, 1.05);
  }
}
@-webkit-keyframes bg_effect {
  0% {
    -webkit-transform: scale(1, 1);
  }
  100% {
    -webkit-transform: scale(1.05, 1.05);
  }
}
</style>

<template>
  <div id="userLayout" :class="['user-layout-wrapper', device]">
    <div class="container">
      <div class="top">
        <div class="header">
          <a href="/">
            <!--<img src="~@/assets/logo.svg" class="logo" alt="logo">-->
            <span class="title">沙曲二号煤矿精准定位综合安全管理系统</span>
          </a>
        </div>
        <div class="desc">
          精细管理 · 精准组织 · 正规循环 · 标准作业
        </div>
      </div>

      <route-view></route-view>

      <div class="footer">
        <!--<div class="links">
          <a href="#" target="_blank">帮助</a>
          <a href="#" target="_blank">隐私</a>
          <a href="#" target="_blank">条款</a>
        </div>-->
        <div class="copyright">
          <img src="/img/clogo.png" alt="">
          <span>Copyright &copy; 2021 </span>
          <a href="http://www.beijingyongan.com/" target="_blank">北京永安信通科技有限公司</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import RouteView from "@/components/layouts/RouteView"
  import { mixinDevice } from '@/utils/mixin.js'

  export default {
    name: "UserLayout",
    components: { RouteView },
    mixins: [mixinDevice],
    data () {
      return {}
    },
    mounted () {
      document.body.classList.add('userLayout')
    },
    beforeDestroy () {
      document.body.classList.remove('userLayout')
    },
  }
</script>

<style lang="less" scoped>
  #userLayout.user-layout-wrapper {
    height: 100%;
    background: url("/img/bj@2x.jpg") no-repeat scroll 50% 50% / cover border-box;
    overflow: hidden;
    &.mobile {
      .container {
        .main {
          max-width: 368px;
          width: 98%;
        }
      }
    }

    .container {
      width: 100%;
      min-height: 100%;
      // background: #f0f2f5 url(~@/assets/background.svg) no-repeat 50%;
      background-size: 100%;
      padding: 110px 0 0;
      position: relative;

      a {
        text-decoration: none;
      }

      .top {
        text-align: center;

        .header {
          height: 44px;
          line-height: 44px;

          .badge {
            position: absolute;
            display: inline-block;
            line-height: 1;
            vertical-align: middle;
            margin-left: -12px;
            margin-top: -10px;
            opacity: 0.8;
          }

          .logo {
            height: 44px;
            vertical-align: top;
            margin-right: 16px;
            border-style: none;
          }

          .title {
            font-size: 33px;
            color: #fff;
            position: relative;
            top: 2px;
          }
        }
        .desc {
          font-size: 14px;
          color: #fff;
          margin-top: 12px;
          margin-bottom: 100px;
        }
      }

      .main {
        min-width: 260px;
        width: 368px;
        margin: 0 auto;
      }

      .footer {
        position: absolute;
        width: 100%;
        bottom: 0;
        padding: 0 16px;
        margin: 48px 0 24px;
        text-align: center;

        .links {
          margin-bottom: 8px;
          font-size: 14px;
          a {
            color: rgba(0, 0, 0, 0.45);
            transition: all 0.3s;
            &:not(:last-child) {
              margin-right: 40px;
            }
          }
        }
        .copyright {
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          font-size: 14px;
          a {
            color: #fff;
          }
          img {
            width: 80px;
            height: auto;
          }
        }
      }
    }
  }
</style>
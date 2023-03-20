import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from './router';
import store from './store/index';
import Antd from 'ant-design-vue';
import 'ant-design-vue/es/message/style/css';
import 'ant-design-vue/es/modal/style/css';
import 'ant-design-vue/dist/antd.less';

import { setupI18n } from '@/locales/setupI18n';

async function bootstrap() {
    const app = createApp(App);
    // app.use(CommonComponent);
    app.use(Antd);
    // app.use(Directives);
    app.use(store);
    app.use(router);

    // 路由守卫
    // setupRouterGuard(router);
    await setupI18n(app);
    app.mount('#app');
}

bootstrap();

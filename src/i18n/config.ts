import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: true,
        resources: {
            en: {
                translation: {
                    nav: {
                        home: "Home",
                        blog: "Blog",
                        login: "Login",
                        logout: "Logout"
                    },
                    hero: {
                        title: "Home, Is Your Personal Universe",
                        subtitle: "Explore personalized modern Feng Shui solutions tailored to you, based on natural laws, cosmic energy, and your home's energy field.",
                        cta: "Start Your Energy Journey"
                    },
                    userInfo: {
                        title: "First, let us know you",
                        subtitle: "We will show your energy in the past year and the next year for FREE.",
                        description: "Every year, environments and energy fields change. Any adjustment not centered on your energy is meaningless. All we do is guide simple shifts for your love, health and abundance.",
                        nickname: "Nickname (Optional)",
                        birthDate: "Birth Date",
                        email: "Email Address",
                        send: "Send Report",
                        preview: "Preview Report",
                        emailRequired: "Please enter a valid email address",
                        dateRequired: "Please select your birth date",
                        calculating: "Calculating your zodiac...",
                        reportReady: "Your fortune report is ready!"
                    },
                    houseDetails: {
                        title: "Your Home's Energy Blueprint",
                        subtitle: "Provide details about your living space to create a personalized energy map."
                    },
                    energyForecast: {
                        title: "Your Energy Forecast",
                        subtitle: "A glimpse into your personal energy shifts for the coming years."
                    }
                }
            },
            zh: {
                translation: {
                    nav: {
                        home: "首页",
                        blog: "博客",
                        login: "登录",
                        logout: "登出"
                    },
                    hero: {
                        title: "家，是你的个人宇宙",
                        subtitle: "探索为您量身定制的现代风水解决方案，基于自然法则、宇宙能量和您家的能量场。",
                        cta: "开启您的能量之旅"
                    },
                    userInfo: {
                        title: "首先，让我们了解您",
                        subtitle: "我们将免费为您展示过去一年和未来一年的能量状况。",
                        description: "每年，环境和能量场都在变化。任何不以您的能量为中心的调整都是毫无意义的。我们所做的就是为您的爱情、健康和财富指引简单的转变。",
                        nickname: "昵称（可选）",
                        birthDate: "出生日期",
                        email: "电子邮箱",
                        send: "发送报告",
                        preview: "预览报告",
                        emailRequired: "请输入有效的电子邮箱地址",
                        dateRequired: "请选择您的出生日期",
                        calculating: "正在计算您的生肖...",
                        reportReady: "您的运势报告已准备好！"
                    },
                    houseDetails: {
                        title: "您家的能量蓝图",
                        subtitle: "提供您的居住空间详情，创建个性化能量地图。"
                    },
                    energyForecast: {
                        title: "您的能量预测",
                        subtitle: "一以此窥探未来几年您的个人能量转变。"
                    }
                }
            }
        },
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;

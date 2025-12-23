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
                    common: {
                        before: "Before",
                        after: "After",
                    },
                    nav: {
                        home: "Home",
                        consultation: "Consultation",
                        homeConsultation: "Home Feng Shui",
                        blog: "Blog",
                        login: "Login",
                        logout: "Logout",
                        switchToZh: "Switch to Chinese",
                        switchToEn: "Switch to English",
                        langShort: {
                            en: "EN",
                            zh: "中"
                        }
                    },
                    hero: {
                        title: "Home, Is Your Personal Universe",
                        subtitle: "Explore personalized modern Feng Shui solutions tailored to you, based on natural laws, cosmic energy, and your home's energy field.",
                        cta: "Start Your Energy Journey"
                    },
                    userInfo: {
                        mainTitle: "Subscribe to Us\n\nWe will provide you with a free exclusive 2025~2026 fortune guide",
                        title: "First, let us know you",
                        subtitle: "This guide will provide you with a comprehensive analysis summary and prediction regarding 5 major aspects: love, wealth, career, health, and luck.",
                        description: "Every year, natural energy and your home's energy field change. But any Feng Shui adjustment not centered on YOUR energy is meaningless.",
                        nickname: "Your Name (Optional)",
                        birthDate: "Birth Date",
                        email: "Email Address",
                        send: "Send Report",
                        preview: "Preview Report",
                        emailRequired: "Please enter a valid email address",
                        dateRequired: "Please select your birth date",
                        calculating: "Calculating your zodiac...",
                        reportReady: "Preview Your Exclusive Fortune Report",
                        subscribe: {
                            label: "Subscribe to receive monthly personalized fortune reports",
                            description: "We will automatically send your exclusive monthly fortune report to your email on the last day of each month."
                        },
                        subscriptionNote: "We will automatically send your exclusive monthly fortune report to your email on the last day of each month.",
                        startJourney: "Start Your Complete Feng Shui Fortune Report Journey",
                        nextStep: {
                            title: "Ready for Your Personalized Energy Analysis?",
                            description: "Unlock deeper insights with our AI-powered Feng Shui analysis. Get a comprehensive energy blueprint tailored to your home and life.",
                            cta: "Get Detailed Energy Report",
                            features: {
                                feature1: "AI-Powered Analysis",
                                feature2: "Personalized Recommendations",
                                feature3: "Complete Energy Mapping"
                            }
                        }
                    },
                    houseDetails: {
                        personalInfo: {
                            title: "Personal Information",
                            name: "Name",
                            email: "Email",
                            gender: "Gender",
                            male: "Male",
                            female: "Female",
                            birthDate: "Birth Date",
                            prefilled: "Auto-filled from homepage"
                        },
                        title: "Your Home's Energy Blueprint",
                        subtitle: "Upload your floor plan to unlock personalized Feng Shui insights",
                        upload: {
                            title: "Upload Floor Plan",
                            subtitle: "Please upload a floor plan with clear directional markings",
                            requirements: "Requirements:",
                            req1: "Must include compass or direction marker (North arrow)",
                            req2: "Prefer official documents (property deed, online floor plans, design drawings)",
                            req3: "Clear room boundaries and labels",
                            dragDrop: "Drag and drop your floor plan here, or click to browse",
                            fileTypes: "Supported formats: JPG, PNG, PDF (max 10MB)",
                            selectFile: "Select File",
                            houseType: "House Type",
                            types: {
                                apartment: "Apartment",
                                condo: "Condo",
                                villa: "Villa",
                                loft: "Loft",
                                other: "Other"
                            },
                            addFloor: "Add Floor",
                            removeFloor: "Remove Floor",
                            floor: "Floor",
                            analyze: "Analyze Floor Plan",
                            reupload: "Upload Different Image"
                        },
                        analyzing: {
                            title: "Analyzing Your Floor Plan",
                            step1: "Detecting compass marker...",
                            step2: "Analyzing image quality...",
                            step3: "Identifying rooms...",
                            pleaseWait: "This may take a moment"
                        },
                        rooms: {
                            title: "Confirm Rooms & Upload Photos",
                            subtitle: "Review the identified rooms and upload photos for each space",
                            identified: "rooms identified",
                            editName: "Click to edit room name",
                            uploadPhoto: "Upload Photo",
                            photoUploaded: "Photo uploaded",
                            progress: "of rooms have photos",
                            continue: "Reveal Your Energy Blueprint ✨",
                            roomName: "Room Name"
                        },
                        errors: {
                            noCompass: "Missing Direction Marker",
                            noCompassDesc: "We couldn't detect a compass or direction marker in your floor plan. Please upload a floor plan that clearly shows North direction.",
                            poorQuality: "Image Quality Too Low",
                            poorQualityDesc: "The image quality is too low to accurately identify rooms. Please upload a clearer, higher resolution floor plan.",
                            unrecognizable: "Unable to Recognize Floor Plan",
                            unrecognizableDesc: "We couldn't recognize this as a valid floor plan. Please upload an official floor plan from property documents or architectural drawings.",
                            tryAgain: "Try Again",
                            reuploadError: "Incorrect Recognition? Re-upload"
                        }
                    },
                    floorPlan: {
                        errors: {
                            invalidType: "Unsupported file type. Please upload JPG, PNG, or PDF.",
                            tooLarge: "File is too large. Please upload a file under 10MB.",
                            missingUserInfo: "Please fill in your email, gender, and birth date.",
                            missingFiles: "Please upload a floor plan for each floor.",
                            maxFloors: "You can upload up to 3 floors only.",
                            invalidFile: "Invalid file"
                        }
                    },
                    energyForecast: {
                        title: "Your Energy Forecast",
                        subtitle: "A glimpse into your personal energy shifts for the coming years.",
                        before: "Before",
                        after: "After",
                        payButton: "Generate Full Report"
                    },
                    consultation: {
                        steps: {
                            upload: "Upload",
                            analysis: "Analysis",
                            report: "Report"
                        },
                        back: "Back",
                        retry: "Retry",
                        processing: "Processing...",
                        confirmRestart: "Start over? Current analysis will be lost.",
                        analyzing: {
                            title: "Analyzing Floor Plan...",
                            message: "Our AI is identifying room structures and orientations.",
                            energyTitle: "Analyzing Home Energy...",
                            energyMessage: "Calculating energy flows based on the 9-Palace grid...",
                            success: "Structure Recognized!",
                            successDesc: "Floor plan successfully parsed."
                        },
                        success: {
                            layout: "Image Analysis Successful!",
                            message: "Structure identified. Preparing energy analysis..."
                        },
                        error: {
                            title: "Analysis Interrupted",
                            generic: "Something went wrong during energy analysis."
                        },
                        energyAssessment: {
                            title: "Calculating Energy Flow...",
                            message: "Evaluating the interaction between your birth chart and the house energy."
                        },
                        reportReady: "Your report is ready!",
                        downloadReport: "Download Report",
                        report: {
                            generating: "Generating Your Feng Shui Report",
                            generatingDescription: "Our AI is analyzing your data and creating a professional report",
                            progress: "Progress",
                            paymentConfirmed: "Payment Confirmed",
                            analyzingData: "Analyzing Your Feng Shui Data",
                            generatingPDF: "Generating PDF Report",
                            downloadPending: "Report Generating, Please Wait...",
                            downloadNow: "Download PDF Report Now",
                            importantNotice: "Important Notice",
                            doNotRefresh: "Please do not refresh the page while generating",
                            estimatedTime: "Estimated time: 30-60 seconds",
                            autoDownload: "Will auto-download when complete",
                            refreshRecovery: "If you accidentally refresh, the system will automatically recover your progress",
                            completed: "Report Generation Complete!",
                            completedDescription: "Your 2026 Feng Shui Report is ready",
                            preview: "Report Preview"
                        },
                        errors: {
                            layoutGridFailed: "Floor plan analysis failed. Please try again.",
                            analysisError: "An error occurred during analysis. Please try again.",
                            energyAssessmentError: "Energy assessment failed. Please try again.",
                            reportGenerationError: "Report generation failed. Please try again.",
                            reportTimeout: "Report generation timeout. Please try again.",
                            paymentProcessingError: "Payment processing failed. Please try again."
                        }
                    },
                    dify: {
                        uploading: "Uploading...",
                        analyzing: "Analyzing...",
                        generating: "Generating report...",
                        processing: "Processing your request...",
                        placeholder: "Analysis results will be displayed here",
                        error: {
                            upload: "File upload failed. Please try again.",
                            api: "API call failed. Please try again later.",
                            network: "Network error. Please check your connection.",
                            parse: "Failed to parse response. Please contact support."
                        }
                    },
                    payment: {
                        title: "Complete Your Purchase",
                        package: "Complete Feng Shui Report",
                        price: "29.99",
                        oneTime: "One-time payment",
                        included: "What's Included:",
                        feature1: "Complete 2026 energy forecast",
                        feature2: "Room-by-room Feng Shui analysis",
                        feature3: "Personalized adjustment recommendations",
                        feature4: "Downloadable PDF report + Email delivery",
                        method: "Payment Method",
                        creditCard: "Credit / Debit Card",
                        email: "Pay via Email Invoice",
                        mvpNotice: "Payment integration coming soon. For now, click below to simulate payment.",
                        close: "Proceed with Payment",
                        processing: "Processing payment...",
                        success: "Payment successful! Generating your report...",
                        error: "Payment failed. Please try again."
                    },
                    features: {
                        title: "Energy-Centered Living",
                        intro: "Your home is an extension of your energy field. We focus on creating a space that not only looks beautiful but also flows with positive energy tailored to you.",
                        feature1: {
                            title: "Personalized Energy Analysis",
                            description: "We analyze your unique energy signature to provide recommendations that truly resonate with your life force."
                        },
                        feature2: {
                            title: "Aesthetics Meets Harmony",
                            description: "Our adjustments prioritize comfort and beauty, ensuring your home feels as good as it looks."
                        }
                    },
                    info: {
                        title: "Information Center",
                        subtitle: "Learn more about our services and policies.",
                        footer: "All rights reserved.",
                        faq: {
                            title: "FAQ",
                            content: "1) What is included in the Feng Shui report? A personalized energy blueprint, room-by-room guidance, and timing tips for the next 12-18 months.\n2) How do you generate recommendations? We combine your birth data with the floor-plan orientation to align Bagua areas, Five Elements balance, and practical placement rules.\n3) Is this a substitute for on-site audits? It is remote guidance; for structural changes or safety issues, consult licensed local professionals.\n4) When will I receive the report? Instant preview for the sample; the full PDF download and email delivery arrive right after successful payment.\n5) How do I update my details? You can re-upload an accurate floor plan anytime or contact support to refresh your analysis.\n6) What if my floor plan is unclear? If we cannot process it, we will work with you to fix the file or provide a refund within 7 days."
                        },
                        pricing: {
                            title: "Pricing",
                            content: "Free: Preview of the demo report and checklist.\n$29.99: Full Home Energy Report (one-time, no auto-renewal) for one property and one set of birth details.\n$49.99: Report + 30-minute expert Q&A (scheduled via email after purchase).\nAdd-ons: Additional floor or unit maps can be added on request.\nAll prices are in USD; local taxes or processing fees may apply."
                        },
                        about: {
                            title: "About Us",
                            content: "We are Feng Shui Energy—a team of classical Feng Shui practitioners, architects, and data scientists who blend traditional Bagua, Flying Stars, and Five Elements principles with modern spatial analysis. Our mission is to make mindful, energy-aligned living accessible without forcing superstition or costly renovations. We respect cultural practices, avoid harmful recommendations, and welcome feedback at support@fengshuienergy.com."
                        },
                        disclaimer: {
                            title: "Disclaimer",
                            content: "Our content is for wellness and educational purposes only. It is not medical, psychological, financial, architectural, legal, or safety advice. Results depend on your environment and actions, and we cannot guarantee specific outcomes. Always verify measurements, obtain necessary permits, and consult licensed professionals for structural, electrical, or health-related decisions. Use of the service implies you accept these limitations."
                        },
                        privacy: {
                            title: "Privacy Policy",
                            content: "Data we collect: contact information (email, name), optional birth date, and uploaded floor plans/photos. Purpose: generating your Feng Shui report, customer support, and product improvement. Storage: encrypted in transit and at rest; access is limited to authorized staff. Retention: working files are kept for up to 90 days unless you request earlier deletion. We do not sell personal data. Sharing: only with essential processors (cloud storage, analytics, payment providers) under confidentiality. Your rights: request access, correction, download, or deletion via support@fengshuienergy.com. Cookies: used for session continuity and basic analytics."
                        }
                    },
                    reportContent: {
                        title: "What's Included in Your Home Feng Shui Energy Report",
                        subtitle: "Comprehensive analysis and personalized recommendations for your living space",
                        whatIncluded: "Your Report Includes:",
                        item1: {
                            title: "2026 Overall Fortune Forecast",
                            description: "Detailed analysis of your personal energy trends and opportunities for the coming year."
                        },
                        item2: {
                            title: "Home Energy Strength & Changes",
                            description: "Assessment of your home's current energy field and how it affects your life."
                        },
                        item3: {
                            title: "Simple Adjustment Methods",
                            description: "Easy-to-implement changes to optimize your home's Feng Shui energy with minimal effort."
                        },
                        item4: {
                            title: "Room-by-Room Optimization",
                            description: "Specific recommendations for each room to achieve the best energy flow and balance."
                        },
                        item5: {
                            title: "Risk Mitigation Strategies",
                            description: "Effective methods to reduce misfortune and negative energy in your living space."
                        },
                        pentagon: {
                            title: "5 Life Dimensions Energy Analysis",
                            description: "We analyze your personal energy across these five essential life dimensions and show the potential improvement after implementing our recommendations.",
                            love: "Love",
                            wealth: "Wealth",
                            career: "Career",
                            health: "Health",
                            luck: "Luck",
                            before: "Before Adjustment",
                            after: "After Adjustment"
                        }
                    }
                }
            },
            zh: {
                translation: {
                    common: {
                        before: "调整前",
                        after: "调整后",
                    },
                    nav: {
                        home: "首页",
                        consultation: "风水咨询",
                        homeConsultation: "居家风水",
                        blog: "博客",
                        login: "登录",
                        logout: "登出",
                        switchToZh: "切换到中文",
                        switchToEn: "切换到英文",
                        langShort: {
                            en: "EN",
                            zh: "中"
                        }
                    },
                    hero: {
                        title: "家，是你的个人宇宙",
                        subtitle: "探索为您量身定制的现代风水解决方案，基于自然法则、宇宙能量和您家的能量场。",
                        cta: "开启您的能量之旅"
                    },
                    userInfo: {
                        mainTitle: "订阅我们\n\n我们将免费为您提供一份专属的2025~2026年运势指南",
                        title: "订阅我们，将免费为你预测新年的运势",
                        subtitle: "运势指南只能提供的基础信息和大方向的能量流动趋势，更权威、更全面、定制化分析还需要依据您的居家布局来综合分析",
                        description: "每年，自然能量和你的房子能量场都在变化。\n但任何不以您的能量为中心的风水调整都是毫无意义的。",
                        nickname: "您的称呼（可选）",
                        birthDate: "出生日期",
                        email: "电子邮箱",
                        send: "发送报告",
                        preview: "预览报告",
                        emailRequired: "请输入有效的电子邮箱地址",
                        dateRequired: "请选择您的出生日期",
                        calculating: "正在计算您的生肖...",
                        reportReady: "预览您的专属运势报告",
                        subscribe: {
                            label: "订阅我们，以获取每月您的专属运势报告",
                            description: "我们将在每月最后一天自动发送您的专属月度运势报告到您的邮箱。"
                        },
                        subscriptionNote: "我们将在每月最后一天自动发送下个月您的专属月度运势报告。",
                        startJourney: "开启您的居家能量探索",
                        nextStep: {
                            title: "准备好获取您的个性化能量分析了吗？",
                            description: "通过我们的AI驱动风水分析，解锁更深层次的洞察。获取为您的家居和生活量身定制的全面能量蓝图。",
                            cta: "获取详细能量报告",
                            features: {
                                feature1: "AI智能分析",
                                feature2: "个性化建议",
                                feature3: "完整能量地图"
                            }
                        }
                    },
                    houseDetails: {
                        personalInfo: {
                            title: "个人信息",
                            name: "您的姓名",
                            email: "电子邮箱",
                            gender: "性别",
                            male: "男",
                            female: "女",
                            birthDate: "出生日期",
                            prefilled: "已从首页自动填充"
                        },
                        title: "您家的能量蓝图",
                        subtitle: "上传您的户型图，解锁个性化风水洞察",
                        upload: {
                            title: "上传户型图",
                            subtitle: "请上传带有明确方位标示的户型图",
                            requirements: "要求：",
                            req1: "必须包含指北针或方位标记（北向箭头）",
                            req2: "建议使用官方文件（房产证、网上户型图、装修设计图）",
                            req3: "房间边界和标签清晰",
                            dragDrop: "拖放户型图到这里，或点击浏览",
                            fileTypes: "支持格式：JPG、PNG、PDF（最大 10MB）",
                            selectFile: "选择文件",
                            houseType: "房屋类型",
                            types: {
                                apartment: "公寓",
                                condo: "共管公寓",
                                villa: "别墅",
                                loft: "LOFT/跃层",
                                other: "其他"
                            },
                            addFloor: "添加楼层",
                            removeFloor: "删除楼层",
                            floor: "楼层",
                            analyze: "分析户型图",
                            reupload: "上传其他图片"
                        },
                        analyzing: {
                            title: "正在分析您的户型图",
                            step1: "检测指北针标记...",
                            step2: "分析图片质量...",
                            step3: "识别房间...",
                            pleaseWait: "这可能需要一点时间"
                        },
                        rooms: {
                            title: "确认房间并上传照片",
                            subtitle: "查看识别出的房间并为每个空间上传照片",
                            identified: "个房间已识别",
                            editName: "点击编辑房间名称",
                            uploadPhoto: "上传照片",
                            photoUploaded: "照片已上传",
                            progress: "个房间已上传照片",
                            continue: "立即揭晓您的能量蓝图 ✨",
                            roomName: "房间名称"
                        },
                        errors: {
                            noCompass: "缺少方位标记",
                            noCompassDesc: "我们无法在您的户型图中检测到指北针或方位标记。请上传清楚标明北向的户型图。",
                            poorQuality: "图片质量过低",
                            poorQualityDesc: "图片质量太低，无法准确识别房间。请上传更清晰、分辨率更高的户型图。",
                            unrecognizable: "无法识别户型图",
                            unrecognizableDesc: "我们无法将此识别为有效的户型图。请上传来自房产文件或建筑图纸的官方户型图。",
                            tryAgain: "重试",
                            reuploadError: "识别有误，重新上传"
                        }
                    },
                    floorPlan: {
                        errors: {
                            invalidType: "不支持的文件格式，请上传 JPG、PNG 或 PDF。",
                            tooLarge: "文件过大，请上传小于 10MB 的文件。",
                            missingUserInfo: "请填写邮箱、性别和出生日期。",
                            missingFiles: "请为每一层上传户型图。",
                            maxFloors: "最多只能上传 3 层户型图。",
                            invalidFile: "文件无效，请重新选择。"
                        }
                    },
                    energyForecast: {
                        title: "您的能量预测",
                        subtitle: "一以此窥探未来几年您的个人能量转变。",
                        before: "调整前",
                        after: "调整后",
                        payButton: "生成完整报告"
                    },
                    consultation: {
                        steps: {
                            upload: "上传",
                            analysis: "分析",
                            report: "报告"
                        },
                        back: "返回",
                        retry: "重试",
                        processing: "处理中...",
                        confirmRestart: "重新开始？当前的分析结果将会丢失。",
                        analyzing: {
                            title: "正在分析您的户型图...",
                            message: "我们的AI正在识别房间结构和方位。",
                            energyTitle: "正在分析居家能量...",
                            energyMessage: "基于九宫飞星图计算能量流动...",
                            success: "结构识别成功！",
                            successDesc: "户型图解析完成。"
                        },
                        success: {
                            layout: "图片分析成功！",
                            message: "结构已识别，正在准备能量分析..."
                        },
                        error: {
                            title: "分析中断",
                            generic: "能量分析过程中出现了问题。"
                        },
                        reportReady: "您的报告已准备就绪！",
                        downloadReport: "下载报告",
                        report: {
                            generating: "正在生成您的风水报告",
                            generatingDescription: "我们的AI正在为您分析数据并生成专业报告",
                            progress: "生成进度",
                            paymentConfirmed: "支付已确认",
                            analyzingData: "正在分析您的风水数据",
                            generatingPDF: "正在生成PDF报告",
                            downloadPending: "报告生成中，请稍候...",
                            downloadNow: "立即下载PDF报告",
                            importantNotice: "重要提示",
                            doNotRefresh: "请勿刷新页面，报告生成中",
                            estimatedTime: "预计需要30-60秒",
                            autoDownload: "完成后将自动下载",
                            refreshRecovery: "如果不小心刷新了页面，系统会自动恢复进度",
                            completed: "报告生成完成！",
                            completedDescription: "您的2026年风水报告已准备就绪",
                            preview: "报告预览"
                        },
                        errors: {
                            layoutGridFailed: "户型图分析失败，请重试。",
                            analysisError: "分析过程中出现错误，请重试。",
                            energyAssessmentError: "能量评估失败，请重试。",
                            reportGenerationError: "报告生成失败，请重试。",
                            reportTimeout: "报告生成超时，请重试。",
                            paymentProcessingError: "支付处理失败，请重试。"
                        },
                    },
                    dify: {
                        uploading: "上传中...",
                        analyzing: "分析中...",
                        generating: "生成报告中...",
                        processing: "处理您的请求中...",
                        placeholder: "这里将会展示分析后的结果",
                        error: {
                            upload: "文件上传失败，请重试。",
                            api: "API调用失败，请稍后重试。",
                            network: "网络错误，请检查您的网络连接。",
                            parse: "解析响应失败，请联系客服。"
                        }
                    },
                    payment: {
                        title: "完成购买",
                        package: "完整风水报告",
                        price: "29.99",
                        oneTime: "一次性付款",
                        included: "包含内容：",
                        feature1: "完整的2026年能量预测",
                        feature2: "逐个房间的风水分析",
                        feature3: "个性化调整建议",
                        feature4: "可下载PDF报告 + 邮件发送",
                        method: "支付方式",
                        creditCard: "信用卡 / 借记卡",
                        email: "通过邮件发票支付",
                        mvpNotice: "支付集成即将推出。现在点击下方模拟支付。",
                        close: "继续支付",
                        processing: "处理支付中...",
                        success: "支付成功！正在生成您的报告...",
                        error: "支付失败，请重试。"
                    },
                    features: {
                        title: "以人为本的能量生活",
                        intro: "您的家是您能量场的延伸。我们致力于打造一个既美观舒适，又能与您的个人能量和谐共鸣的居住空间。",
                        feature1: {
                            title: "个性化能量分析",
                            description: "我们分析您独特的能量特征，提供真正与您的生命力共鸣的建议。"
                        },
                        feature2: {
                            title: "美学与和谐共存",
                            description: "我们的调整方案首要考虑舒适与美观，确保您的家不仅看起来美，住起来更美。"
                        }
                    },
                    info: {
                        title: "信息中心",
                        subtitle: "了解更多关于我们的服务和政策。",
                        footer: "保留所有权利。",
                        faq: {
                            title: "常见问题",
                            content: "1) 风水报告包含什么？\n包含个性化能量蓝图、逐个房间的布局建议以及未来12-18个月的流年运势。\n\n2) 建议是如何生成的？\n结合您的出生信息和户型图方位，运用九宫飞星和五行平衡原理进行智能分析。\n\n3) 这能替代现场看风水吗？\n这是远程风水指导。涉及结构性改动或特定安全问题，建议咨询当地专业人士。\n\n4) 何时能收到报告？\n支付成功后，完整PDF报告将立即生成发送至您的邮箱。\n\n5) 客服联系方式？\n如有任何疑问，请发送邮件至 cocoliu114@gmail.com。"
                        },
                        pricing: {
                            title: "定价方案",
                            content: "• 基础版 (免费)：订阅即可获取2025~2026年十二生肖流年运势指南。\n\n• 完整风水报告 ($29.99)：包含详细的居家风水能量分析、针对性布局建议及五大维度（爱情、财运、事业、健康、运气）的深入预测。一次性付费，无自动续费。\n\n所有价格均为美元(USD)。"
                        },
                        about: {
                            title: "关于我们",
                            content: "Feng Shui Energy 致力于将古老的东方风水智慧与现代科技相结合。我们的团队由传统风水研究者和数据科学家组成，旨在为您提供科学、直观且实用的居家能量解决方案，帮助您打造和谐的居住环境。\n\n联系我们：cocoliu114@gmail.com"
                        },
                        disclaimer: {
                            title: "免责声明",
                            content: "本网站提供的风水分析报告仅供参考、娱乐及教育用途。所有建议基于传统风水学说，不构成任何医疗、心理、法律、建筑或专业投资建议。用户应根据自身判断做出决定。对于因参考本网站内容而产生的任何后果，我们不承担法律责任。"
                        },
                        privacy: {
                            title: "隐私政策",
                            content: "我们尊重并保护您的隐私。您提交的所有个人信息（如出生日期、户型图等）仅用于生成分析报告和提供服务。我们采取严格的数据加密措施，绝不会向第三方出售您的个人数据。有关数据处理的详细信息，或要求删除数据，请联系 cocoliu114@gmail.com。"
                        }
                    },
                    reportContent: {
                        title: "您的居家风水能量报告包含哪些内容",
                        subtitle: "全面分析和个性化建议，为您的生活空间量身定制",
                        whatIncluded: "报告包含：",
                        item1: {
                            title: "2026年整体运势预测",
                            description: "详细分析您来年的个人能量趋势和机遇。"
                        },
                        item2: {
                            title: "居家风水能量的强弱和变化",
                            description: "评估您家当前的能量场及其对生活的影响。"
                        },
                        item3: {
                            title: "最简单的调整方式",
                            description: "易于实施的改变，用最小的努力优化您家的风水能量。"
                        },
                        item4: {
                            title: "各个房间如何调整才能达到最好的效果",
                            description: "针对每个房间的具体建议，实现最佳能量流动和平衡。"
                        },
                        item5: {
                            title: "如何有效降低灾祸和不吉利的运气",
                            description: "有效方法减少您生活空间中的不幸和负能量。"
                        },
                        pentagon: {
                            title: "5大生活维度能量分析",
                            description: "我们分析您在这五个生活维度的个人能量，并展示实施我们建议后的潜在改善。",
                            love: "感情",
                            wealth: "财运",
                            career: "事业",
                            health: "健康",
                            luck: "运气",
                            before: "调整前",
                            after: "调整后"
                        }
                    }
                }
            }
        },
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;

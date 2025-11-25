export interface ZodiacFortune {
    icon: string;
    name: { zh: string; en: string };
    intro: { zh: string; en: string };
    sections: {
        love: { zh: string; en: string };
        wealth: { zh: string; en: string };
        health: { zh: string; en: string };
        career: { zh: string; en: string };
        luck: { zh: string; en: string };
    };
}

export const zodiacFortunes: Record<string, ZodiacFortune> = {
    Rat: {
        icon: "🐭",
        name: { zh: "鼠", en: "Rat" },
        intro: {
            zh: "亲爱的你：你聪明、反应快，又有一点点爱想太多。过去一年像是在背着行李爬坡，而新的一年，更像在负重之下继续前行、练出真正的力量。",
            en: "Dear you: You are smart, quick-witted, but tend to overthink a little. The past year felt like climbing a hill with heavy luggage, but the new year is more about moving forward under the load and building real strength."
        },
        sections: {
            love: {
                zh: "2025 里，你在人际和感情中的敏感度变高，关系里有过温暖，也有几次说不清的委屈；很多情绪你习惯吞进肚子里，笑着继续照顾别人。到了 2026，整体能量比较重，容易对亲密关系有“怎么又出问题”的无力感。请记住：这不是你不值得被爱，而是老旧的相处方式到了必须升级的时候。这一年，尽量把「我其实很难过」这种话，提前一点说出口，而不是等到爆发才讲。真诚的表达，会帮你守住重要的人。",
                en: "In 2025, your sensitivity in relationships increases. There was warmth, but also unspoken grievances. You tend to swallow your emotions and smile while caring for others. In 2026, the energy is heavier, bringing a sense of helplessness in intimacy. Remember: It's not that you don't deserve love, but that old ways of relating must be upgraded. Try to express 'I'm actually sad' earlier, rather than waiting for an explosion. Sincere expression will help you keep important people."
            },
            wealth: {
                zh: "2025 的钱，对你来说偏向「稳中有进」，工作有发挥空间，贵人和机会都不算少，只是你会隐隐担心“以后会不会不稳定”。进入 2026，能量起伏加大，更像是在考验你：能不能在压力下，依然保持清醒。大额消费和合作，宁愿慢一点、看久一点也不要仓促定案。你并不是不能赚钱，而是今年更适合守好已有的基础，不被情绪和冲动带节奏。",
                en: "In 2025, wealth is 'steady progress'. There's room for work, nobles, and opportunities, but you worry about future instability. In 2026, energy fluctuates more, testing your clarity under pressure. For large expenses and collaborations, take your time. It's not that you can't make money, but this year is better for guarding your foundation and not being swayed by emotions."
            },
            health: {
                zh: "2025，你最常累的不是身体，而是心——睡眠、胃口、肩颈，都在替你“吸收”情绪。2026 年，更要小心长期紧绷带来的疲惫感。大环境不轻松时，越要把「规律睡觉、好好吃饭」当成底线。累的时候，允许自己停一停，而不是逼自己再硬撑一下。心如果被照顾好了，你会发现身体也在慢慢回暖。",
                en: "In 2025, it's your heart that's tired, not just your body—sleep, appetite, and shoulders are absorbing emotions. In 2026, be wary of exhaustion from long-term tension. When the environment is tough, make 'regular sleep and eating' your baseline. Allow yourself to stop when tired. If your heart is cared for, your body will warm up too."
            },
            career: {
                zh: "2025，你在工作上其实有进展，人看起来依旧可靠，只是很多辛苦都藏在细节里。你的努力帮你积累了人脉与信用，这是明明白白的底层资产。2026 的工作环境变数多，常常不是你做得好不好，而是外在条件在变。遇到推迟、改计划、重来一次时，先保护好自己的节奏：重要的决定，拖过一两天再确认；能写下来、落实成流程的，就不要只靠记性。这些看似普通的小动作，会在这一年帮你稳住局面。",
                en: "In 2025, you made progress at work and appeared reliable, but the hard work was in the details. Your efforts built connections and credit. In 2026, the work environment is variable. When facing delays or changes, protect your pace: delay important decisions by a day or two; write things down instead of relying on memory. These small actions will stabilize your situation."
            },
            luck: {
                zh: "2025 的你，其实是一路被推动着成长：负责更多、能见度更高，只是你自己还没来得及感到骄傲。2026 对你而言，是「重训练年」：生活会安排一些曲折，逼你练出更好的判断力、界限感和抗压能力。请对自己说一句：“这一年我不会被打倒，而是被打磨。”当你用这样的眼光看待经历，许多现在的难题，会变成以后你最硬气的底气。",
                en: "In 2025, you were pushed to grow: more responsibility, higher visibility. 2026 is a 'heavy training year': life will bring twists to force better judgment, boundaries, and resilience. Tell yourself: 'I will not be defeated, but polished.' Viewing experiences this way turns problems into your strongest foundation."
            }
        }
    },
    Ox: {
        icon: "🐮",
        name: { zh: "牛", en: "Ox" },
        intro: {
            zh: "亲爱的你：你稳、耐心强，又习惯把苦往肚里咽。过去一年像是在把地基打结实，而新的一年，则是在这块地基上，慢慢长出可以看见的成果。",
            en: "Dear you: You are steady, patient, and used to swallowing bitterness. The past year was about solidifying the foundation, and the new year is about letting visible results grow on this foundation."
        },
        sections: {
            love: {
                zh: "2025，你在关系里多半扮演“可靠那一方”，很多事你不说，但你会默默去做，安全感大多是你提供的。2026，能量有点忽好忽坏，关系里容易有一些小波折、误会或现实压力。别急着把所有责任都揽在自己身上，试着把“我也会累，我也需要被照顾”说出来。你越肯把心摊出来，真正在意你的人，越会向你靠近。",
                en: "In 2025, you were the 'reliable one', providing security silently. In 2026, energy fluctuates, bringing minor twists or realistic pressures in relationships. Don't take all responsibility; try saying 'I get tired too, I need care too'. The more you open your heart, the closer those who care will come."
            },
            wealth: {
                zh: "2025 的钱，对你来说是「稳稳的」，有机会通过合作、专业表现获取更稳定的收入，只是你会更谨慎，不太敢轻易尝试新方向。2026 年，并不适合太激进的布局，而更像是整理账本的一年：看清什么是必要支出，什么其实只是“情绪购物”。当你愿意一点点简化金钱流向，你会发现，原来自己已经有了不小的底气。",
                en: "In 2025, money was 'steady', with stable income from cooperation and professionalism, but you were cautious. 2026 is not for radical moves, but for organizing the ledger: distinguish necessary expenses from 'emotional shopping'. Simplifying money flow will reveal your substantial foundation."
            },
            health: {
                zh: "2025，你常常“事先想好所有最坏的情况”，脑袋很累，身体也就跟着硬邦邦。来到 2026，要特别留意长期疲惫累积的问题。哪怕只是在每天睡前，用 5 分钟做拉伸、深呼吸，都比继续刷手机更能帮你恢复。你不是不能累，你只是不能一直假装不累。",
                en: "In 2025, you often anticipated the worst, tiring your mind and stiffening your body. In 2026, watch out for accumulated fatigue. Even 5 minutes of stretching before bed helps more than scrolling. You can be tired, but you can't keep pretending you're not."
            },
            career: {
                zh: "2025，你在工作上属于“别人交代的事都能放心”的类型，人际合作机会增加，只是有时会觉得自己“被需要很多，却很少被看见”。2026 的职场，对你来说是「边修边开车」的一年：任务可能忽然变多，节奏时快时慢。你真正需要做的，是慢慢学会：哪些事情必须亲自扛；哪些可以分给别人；哪些其实可以说“不急”。当你从“凡事都扛”改成“挑重点扛”，你会发现，原来自己的能量是够用的。",
                en: "In 2025, you were reliable but felt unseen. 2026 is a 'repair while driving' year: tasks may increase, pace varies. Learn to distinguish what you must do, what to delegate, and what can wait. Shifting from 'carrying everything' to 'carrying priorities' will show you have enough energy."
            },
            luck: {
                zh: "2025 的整体感觉，是不惊天动地，但悄悄地把你往上托了一点。很多机会，看起来像“顺其自然”，其实都是之前稳扎稳打换来的。2026 不是爆发年，却是「越到年底越知道自己在变强」的一年。请允许自己走得慢一点，但一定要承认自己每一点小小的前进——这会让你的运气，越来越愿意站在你这边。",
                en: "2025 quietly lifted you up. Opportunities seemed natural but came from steady work. 2026 isn't an explosive year, but one where you realize you're getting stronger by year-end. Allow yourself to go slow, but acknowledge every step forward—this invites luck to your side."
            }
        }
    },
    Tiger: {
        icon: "🐯",
        name: { zh: "虎", en: "Tiger" },
        intro: {
            zh: "亲爱的你：你有劲、有魄力，也不喜欢被束缚。过去一年像是在试探各种可能，而新的一年，则更像“舞台灯光慢慢打亮”的一年。",
            en: "Dear you: You are energetic, bold, and dislike restraint. The past year was about testing possibilities, and the new year is like the stage lights slowly turning up."
        },
        sections: {
            love: {
                zh: "2025，你在感情里有真诚，也会有点“火力太猛”，一时情绪上头说过几句重话，事后又有点后悔。2026，整体能量对你相当友好，更有利于你好好经营重要关系。很多资料都提到，这一年你的魅力、资源、人缘都会抬头，只是要小心小人和是非，所以越重要的人，越值得你温柔一点、低调一点。",
                en: "In 2025, you were sincere but sometimes too intense, regretting harsh words later. 2026 is friendly to relationships. Your charm and popularity will rise, but beware of gossip. Treat important people with more gentleness and low profile."
            },
            wealth: {
                zh: "2025，你在钱这件事上“胆子不小”，有过一些勇敢尝试，有成功也有教训。到了 2026，整体财运被看好——只要你懂得收敛一点冲动，持续把精力放在真正长期有价值的方向上，收入有机会明显上升。记得：你不需要一夜之间证明什么，你只要一年比一年更稳。",
                en: "In 2025, you were bold with money, with mixed results. In 2026, wealth looks good—if you curb impulsiveness and focus on long-term value, income can rise. You don't need to prove anything overnight, just be steadier each year."
            },
            health: {
                zh: "2025，你的能量强，但也容易熬夜、拼命、用身体换进度。2026 年，行动机会更多，你更需要“用得上、用得久”的身体。保持运动，让自己有一个可以释放压力的出口，比补品更有用。累的时候停一下，不会让你落后，反而会让你走得更远。",
                en: "In 2025, you traded health for progress. In 2026, with more action, you need a durable body. Exercise is better than supplements for stress relief. Stopping when tired won't make you fall behind; it helps you go further."
            },
            career: {
                zh: "2025，你已经开始看见一些新方向，有人邀请你、有机会参与更重要的项目。2026 的职场，对你来说是“精彩可期的一年”：能量支持你冲出原本的框架，上升空间比以往更明显。你要做的，是在锋芒和低调之间找到平衡：该出手的时候全力以赴，不该多说的时候保持沉默。这样一来，机会会留在你手上，不会变成别人的故事。",
                en: "In 2025, you saw new directions. 2026 is 'exciting and promising': energy supports breaking frames, with obvious upward space. Balance sharpness and low profile: go all out when needed, stay silent when not. This keeps opportunities in your hands."
            },
            luck: {
                zh: "2025，让你习惯了在变化里做决定；2026，则是让你看见：原来自己真的可以开一条新路。请大胆一点跟自己说：“这一年，我值得被看见，也有能力扛得起更大的版图。”当你相信自己，好的机会更容易停在你面前，而不是匆匆路过。",
                en: "2025 taught you to decide amidst change; 2026 shows you can blaze a new trail. Boldly tell yourself: 'I deserve to be seen and can handle a bigger map.' Believing in yourself makes opportunities stay."
            }
        }
    },
    Rabbit: {
        icon: "🐰",
        name: { zh: "兔", en: "Rabbit" },
        intro: {
            zh: "亲爱的你：你温柔、细腻，很在意氛围。过去一年像是在修补和疗愈，而新的一年，则比较像“被温柔地推着向前走”。",
            en: "Dear you: You are gentle, delicate, and care about atmosphere. The past year was for healing, and the new year is like being gently pushed forward."
        },
        sections: {
            love: {
                zh: "2025，你在关系里更渴望安稳，不太想再耗在拉扯里；有时宁可自己退一步，也不愿把话说得太白。2026，在感情上是被看好的年份：适合认真经营现有的亲密关系，也适合认真考虑“我要跟什么样的人一起生活很久”。遇到让你心里变平静的人，请多给对方一点时间，也给自己一点信任感。",
                en: "In 2025, you craved stability and avoided conflict. 2026 is good for relationships: cultivate existing ones or consider long-term partners. If someone brings you peace, give them time and trust yourself."
            },
            wealth: {
                zh: "2025，你多半走的是“稳守”的路子，收入中规中矩，但花钱也算节制。2026，整体能量比去年更友好，适合慢慢把钱用在让你变强的地方：学习、健康、提升专业。你不需要追逐任何一夜暴涨，只要在每次花钱前问自己：“这笔钱，会不会让未来的我更轻松？”就足够。",
                en: "In 2025, you played it safe with money. 2026 is friendlier, suitable for spending on self-improvement: learning, health, skills. Don't chase quick riches; ask if the expense makes your future easier."
            },
            health: {
                zh: "2025，你很多不开心，会变成身体的小毛病：头痛、睡不好、没胃口。2026，不一定会自动变健康，但你若愿意对自己好一点，恢复会很明显。生活里多安排一些真正让你放松的时刻——做喜欢的事、跟喜欢的人待在一起、给自己一点独处空间——这些都算在“保养”里。",
                en: "In 2025, unhappiness became physical ailments. 2026 won't automatically fix health, but treating yourself well will speed recovery. Schedule relaxing moments—doing what you like, being with loved ones, solitude—as 'maintenance'."
            },
            career: {
                zh: "2025，你在工作中的表现，往往比自己评价的好；只是你习惯淡淡地过，不太会主动说：“这件事是我做好了。”2026，这种低调认真，会开始被更多人看见。很多资料都提到，这一年对你来说是有“好机会＋贵人”的年份，只要你愿意在关键时刻举手，说一句“这块我可以试试看”，你会惊喜地发现自己其实做得到。",
                en: "In 2025, you performed better than you thought but stayed humble. In 2026, your diligence will be seen. It's a year of 'opportunities + nobles'. If you raise your hand and say 'I can try this', you'll surprise yourself."
            },
            luck: {
                zh: "2025，是一盏帮你走出前两年疲惫的小灯；2026，则比较像一扇缓缓打开的窗——风景不会一下子全部出现，但每个月都会比上个月再亮一点。请温柔地对自己说：“我已经不在原点了，我正在变好。”运气最喜欢这样的你。",
                en: "2025 was a lamp guiding you out of fatigue; 2026 is a slowly opening window—scenery appears gradually, brighter each month. Gently tell yourself: 'I'm not where I started, I'm getting better.' Luck loves this version of you."
            }
        }
    },
    Dragon: {
        icon: "🐲",
        name: { zh: "龙", en: "Dragon" },
        intro: {
            zh: "亲爱的你：你有气场、有担当，又不甘心平庸。过去一年像是从风浪中缓慢靠岸，而新的一年，则更像是在稍微平稳的海面上，重新规划航线。",
            en: "Dear you: You have presence, responsibility, and refuse mediocrity. The past year was like docking from a storm; the new year is replanning the route on calmer seas."
        },
        sections: {
            love: {
                zh: "2025，大环境对你的感情算是“比去年轻松一点”，你更有心力照顾关系，也更愿意放下某些执念。2026，整体能量略有起伏，但并不糟：适合用更务实、更长线的角度看待亲密——少一点“要不要立刻给答案”，多一点“我们能不能一起慢慢调整”。只要你不把压力全丢给关系，反而容易走得久。",
                en: "In 2025, relationships were easier, and you let go of some obsessions. 2026 has fluctuations but isn't bad: view intimacy pragmatically and long-term. Less 'immediate answers', more 'adjusting together'. Don't dump pressure on the relationship, and it will last."
            },
            wealth: {
                zh: "2025，对你来说，有一种“终于没那么卡”的感觉，财务上的麻烦事减少了一些。2026，收入方面有机会获得认可与加码，但支出也可能因为生活层级提升而跟着增加。你真正需要留意的，是情绪化消费和“凭感觉做决定”的投资。越是想翻身，就越要慢一点动钱。",
                en: "In 2025, financial troubles eased. In 2026, income may rise, but so might expenses. Watch out for emotional spending and impulsive investments. The more you want to turn things around, the slower you should move money."
            },
            health: {
                zh: "2025，你的身心状态整体在恢复，过去某些长期的紧绷有所缓解。2026，情绪容易受外界影响，有时会突然陷入低潮或莫名烦躁。试着建立几个「一看到就会安静下来的画面」——一首歌、一条路、一个地方，每当心乱的时候就去那里待一会，你会发现自己可以更温柔地度过这些波峰波谷。",
                en: "In 2025, you recovered from tension. In 2026, emotions may be affected by the outside world. Establish 'calming images'—a song, a path, a place. Go there when unsettled to weather the ups and downs gently."
            },
            career: {
                zh: "2025，你在事业上有“被帮一把”的感觉，有些积压很久的事情终于被解决。2026，表现仍然被看好，只是会夹杂几次让你质疑自我的波动。记得：一两件没做好，不等于你不行；反而是提醒你要把节奏调整得更健康。稳住自己的标准——该要求高的地方继续高，该放过自己的地方就适度放过。",
                en: "In 2025, you felt helped in your career. 2026 looks good, despite some self-doubt. One or two failures don't mean you're incapable; they remind you to adjust your pace. Maintain standards but know when to let go."
            },
            luck: {
                zh: "2025，是让你从“被逼着扛”转为“比较能主动安排生活”的一年；2026，运气并不吝啬，只是更希望你用脚踏实地的方式去接住它。越是认真对待手上的事，越会有“明明还在同一份工作，却感觉自己站的位置不一样了”的惊喜。",
                en: "2025 shifted you from 'forced to carry' to 'proactive planning'. 2026 offers luck to those who are grounded. Taking tasks seriously will bring the surprise of feeling like you're in a different position even in the same job."
            }
        }
    },
    Snake: {
        icon: "🐍",
        name: { zh: "蛇", en: "Snake" },
        intro: {
            zh: "亲爱的你：你安静、敏锐，擅长在表面平静中观察一切。过去一年像是“对自己的一次大体检”，而新的一年，更像是“带着新生的皮，走向更大的世界”。",
            en: "Dear you: You are quiet, sharp, and observant. The past year was a 'major checkup', and the new year is like walking into a bigger world with new skin."
        },
        sections: {
            love: {
                zh: "2025，对你而言是非常深刻的一年：感情里有旧模式被迫结束，也有新的可能悄悄出现。你更清楚自己能接受什么、不能再忍什么。2026，整体能量明显比去年轻松许多，更有利于把感情经营成“能一起成长”的样子。你可以放心一点地去相信：真正适合你的人，是能和你一起解决问题的人，而不是只在顺境陪笑的人。",
                en: "2025 was profound: old patterns ended, new possibilities emerged. You know your limits. 2026 is lighter, favoring 'growing together'. Trust that the right person solves problems with you, not just laughs with you in good times."
            },
            wealth: {
                zh: "2025，你的钱多半花在“必要的调整”和“不得不的支出”上，压力不小，但同时也让你学会更务实地规划未来。2026，是一个“抬头的年份”：适合谋求更好的位置、薪水或方向，只要你肯提前准备，整体机会是向上的。金钱上，更像从“勉强撑住”慢慢走向“有余力规划”。",
                en: "In 2025, money went to necessary adjustments, teaching pragmatism. 2026 is a 'head-up year': seek better positions or pay. Opportunities are upward if prepared. Finances move from 'barely holding on' to 'planning with surplus'."
            },
            health: {
                zh: "2025，你在精神和情绪上经历了一场脱壳，很多旧的压力、旧的伤口，都被翻出来看了一遍。2026，身体与心的修复力都在回升。只要你愿意给自己更温柔的生活节奏——吃得更规律一点、睡得再早一点、减少硬撑——你的状态会有肉眼可见的改善。",
                en: "In 2025, you shed emotional skin, facing old wounds. In 2026, recovery increases. A gentler rhythm—regular meals, earlier sleep, less forcing—will visibly improve your state."
            },
            career: {
                zh: "2025，是“边改边撑”的一年，你在工作上可能不太舒服，但又硬生生扛过来了。2026，是很适合向上跃迁的一年：换领域、换公司、争取晋升、争取更重要的位置，都比去年更有胜算。你已经脱了一层旧皮，现在可以考虑走到更匹配自己能力的地方。",
                en: "2025 was 'change and endure'. 2026 is for upward leaps: changing fields, companies, or promotion. You've shed the old skin; now go where your abilities are matched."
            },
            luck: {
                zh: "2025，是你近年很关键的转折点；2026，则是“慢慢走上坡路”的阶段。请认真对自己说：“我已经穿过最难的一段，现在轮到好运慢慢追上我。”当你愿意这样相信，很多机会就有了落脚的空间。",
                en: "2025 was a turning point; 2026 is the 'uphill climb'. Tell yourself: 'I've passed the hardest part, now luck is catching up.' Believing this gives opportunities space to land."
            }
        }
    },
    Horse: {
        icon: "🐴",
        name: { zh: "马", en: "Horse" },
        intro: {
            zh: "亲爱的你：你热情、爱自由，不喜欢被束缚。过去一年像是在加速奔跑，而新的一年，更像是在复杂路况里学会“收油门”。",
            en: "Dear you: You are enthusiastic, freedom-loving, and dislike restraint. The past year was speeding up; the new year is learning to 'ease off the gas' in complex conditions."
        },
        sections: {
            love: {
                zh: "2025，你在人际和感情上人气不低，能量外放、关系热络，也更容易遇到有火花的互动。2026，整体环境对你并不算轻松，生活节奏多变，心里难免会有“怎么突然变难走了”的感觉。感情上，更容易因为外在压力（工作、家庭、金钱）影响心情，所以要记得：对重要的人，多一点耐心，少一点迁怒。学会在风大时，先把心收进安全的地方，而不是把矛头指向身边的人。",
                en: "In 2025, you were popular and energetic. 2026 is tougher, with variable rhythms. External pressures may affect relationships. Be patient with loved ones, don't vent anger. When the wind blows, shelter your heart instead of attacking others."
            },
            wealth: {
                zh: "2025，你的能力和表现，有机会换来更好的资源和机会，金钱能量相对顺着你的行动而流动。2026，对金钱来讲，更像“收成＋考验并存”的一年：收入不一定差，但变数多，支出和突发状况也可能跟着变大。与其急着扩张，不如学会把手上已有的东西守稳、整理好，别轻易被短期诱惑牵着走。",
                en: "In 2025, ability brought resources. 2026 is 'harvest + test': income may be good, but expenses and variables increase. Stabilize what you have rather than expanding; don't be led by short-term temptations."
            },
            health: {
                zh: "2025，你忙得开心时容易忘记休息，情绪一兴奋就过度消耗。2026，生活多变、压力上升，更需要学会在奔跑中给自己“补给站”。哪怕是固定的一顿好好吃的饭、一段说走就走的散步，都是在提醒自己：你不是只负责表现，你也值得被照顾。",
                en: "In 2025, excitement led to overexertion. 2026 brings stress; you need 'supply stations'. A good meal or a walk reminds you: you're not just for performing, you deserve care too."
            },
            career: {
                zh: "2025，你有不少向上发展的机会，只要愿意行动，常常能看到成绩。2026，舞台还在，但路面更颠簸。很多时候，不是让你停下，而是让你学会：如何在多变条件中保持清醒；如何在资源有限时选最要紧的事做。当你愿意沉下心，把“耀眼”换成“扎实”，这一年反而会为下一轮真正的起飞打下基础。",
                en: "In 2025, action brought results. 2026 is bumpier. Learn to stay clear in change and prioritize with limited resources. Replacing 'dazzling' with 'solid' builds the foundation for the next takeoff."
            },
            luck: {
                zh: "2025，是“贵人和机会齐来的年份”；2026，是“沉潜和调整的年份”。不要被表面的起伏吓到，告诉自己：“这不是我运气变差，而是好运要我先长大一点。”当你愿意把这一年当成练功房，而不是审判场，压力就会慢慢转成底气。",
                en: "2025 was full of nobles and chances; 2026 is for adjustment. Don't be scared by ups and downs. Tell yourself: 'Luck wants me to grow up.' Treat this year as a training ground, not a trial, and pressure becomes strength."
            }
        }
    },
    Goat: {
        icon: "🐐",
        name: { zh: "羊", en: "Goat" },
        intro: {
            zh: "亲爱的你：你温柔、重感受，看似软，其实心里很有分寸。过去一年像是在学习照顾自己的心，而新的一年，则更像是“带着心去收成”。",
            en: "Dear you: You are gentle and sensitive, but have inner boundaries. The past year was learning self-care; the new year is 'harvesting with heart'."
        },
        sections: {
            love: {
                zh: "2025，你在关系里学会了多为自己想一点：不再一味顾及别人情绪，而是慢慢找平衡。2026，整体能量对你非常友好：有利于亲密关系的稳定与升级，也有利于遇见对你真心的人。你可以允许自己更有自信一点：你值得被温柔对待，你的需求也值得被认真听见。",
                en: "In 2025, you learned to prioritize yourself. 2026 is very friendly: good for stable relationships and meeting sincere people. Be confident: you deserve gentleness and your needs deserve to be heard."
            },
            wealth: {
                zh: "2025，你在钱的使用上，开始意识到“不能再为了让别人开心而乱花”。2026，金钱能量被看好，适合为自己的长期生活做规划——改善居住环境、为未来目标存钱、投资在自己的技能上。唯一要注意的，是避免因为过度乐观而忽略风险评估。记得：再好的年份，基本功都不能丢。",
                en: "In 2025, you stopped spending to please others. 2026 looks good for wealth: plan for the long term—home, savings, skills. Avoid over-optimism and risk. Even in good years, keep the basics."
            },
            health: {
                zh: "2025，你的精神状态比前一年好一些，但偶尔仍会陷入“没来由的累”。2026，整体发展非常亮眼，但身体体质可能略显疲弱，容易小病小痛反复出现。所以，就算再忙，也别把检查和休息往后拖。越是好运年，越要好好保护自己。",
                en: "In 2025, you felt better but occasionally tired. 2026 is bright, but your body may be weak with minor ailments. Don't delay checkups or rest. Protect yourself especially in lucky years."
            },
            career: {
                zh: "2025，你在工作上更懂得保护自己，不再随便答应不合理的要求。2026，是非常适合向外伸手的一年：说出你的想法，争取更适合你的岗位与合作，敢要，也敢承担。许多资源和贵人，会在你开口之后出现，而不是提前等着你。",
                en: "In 2025, you protected yourself at work. 2026 is for reaching out: speak up, ask for positions, and take responsibility. Resources and nobles appear after you ask, not before."
            },
            luck: {
                zh: "2025，是修复期；2026，是“喜庆丰收年”的能量：整体在走上坡，只要你不自我设限，很多看似不可能的事，都会有松动的机会。对自己说：“这一年，我可以期待好事连着来。”它们真的会更愿意来找你。",
                en: "2025 was repair; 2026 is 'joyful harvest'. It's an uphill path. Don't limit yourself, and impossible things may happen. Tell yourself: 'I can expect good things.' They will come."
            }
        }
    },
    Monkey: {
        icon: "🐒",
        name: { zh: "猴", en: "Monkey" },
        intro: {
            zh: "亲爱的你：你机灵、好奇心强，喜欢尝试新鲜事。过去一年像是“社交和机会都在放大”，而新的一年，则更像“需要在低调中稳住自己”。",
            en: "Dear you: You are clever, curious, and love new things. The past year amplified social life and opportunities; the new year requires staying steady in a low profile."
        },
        sections: {
            love: {
                zh: "2025，你在人际和感情上都很热络，认识不少新朋友，暧昧和火花也不会少。2026，整体能量偏向“安静修整”：关系里要特别留意口舌是非与误会，越重要的人，越不要拿玩笑或情绪去赌。对待感情，真诚和收敛，比热闹更重要。",
                en: "In 2025, social life was hot. 2026 leans towards 'quiet adjustment': beware of gossip and misunderstandings. Don't gamble with important relationships using jokes or emotions. Sincerity and restraint matter more than excitement."
            },
            wealth: {
                zh: "2025，你在赚钱与机会上的嗅觉敏锐，常常能先一步看到好点子。2026，对金钱来说，是“适合把风险降到最低”的一年：看起来不错的机会，背后可能带着不少隐藏麻烦。与其到处撒，不如守住几个打底项目，把支出变得更有秩序。",
                en: "In 2025, you spotted money-making ideas early. 2026 is for minimizing risk: good opportunities may hide trouble. Stick to foundational projects and organize expenses instead of scattering resources."
            },
            health: {
                zh: "2025，你多半是“脑子和行程都停不下来”，真正休息的时间不多。2026，压力和心情波动，可能通过身体表现出来——睡眠、消化、免疫力都值得多关注。你最需要学的，是“把玩乐和放松，从消耗变成补充”。做完一件事就立刻排满下一件，不如留一点空白给自己。",
                en: "In 2025, you couldn't stop. 2026 may manifest stress physically—sleep, digestion, immunity need attention. Turn play and relaxation into replenishment, not consumption. Leave some blank space for yourself."
            },
            career: {
                zh: "2025，你的社交与表达，为你争取到不少舞台，事业上有可见的机会。2026，事业并不是没机会，而是多了几层考验：特别是人际与小人议题。越是在公开场合，越要注意自己的说话方式与态度。把重心放回到真正的专业上，一年下来，反而能留下更扎实的成果。",
                en: "In 2025, social skills won you stages. 2026 brings tests, especially interpersonal ones. Watch your words in public. Focus on professionalism to leave solid results."
            },
            luck: {
                zh: "2025，是机会密集的一年；2026，是要你“收心，别被外界牵着走”的一年。请对自己说：“我可以暂时走慢一点，但我要走得更准。”当你把选项整理好，运气就会帮你把真正适合的那条路照亮。",
                en: "2025 was opportunity-dense; 2026 asks you to 'focus inward'. Tell yourself: 'I can go slow, but I must be accurate.' Organizing options will light up the right path."
            }
        }
    },
    Rooster: {
        icon: "🐓",
        name: { zh: "鸡", en: "Rooster" },
        intro: {
            zh: "亲爱的你：你认真、讲原则，又有一点点完美主义。过去一年像是在把生活打理得更有条理，而新的一年，则更像是在“边闯关边被提醒要柔软一点”。",
            en: "Dear you: You are serious, principled, and a bit of a perfectionist. The past year was organizing life; the new year is 'leveling up while learning to be softer'."
        },
        sections: {
            love: {
                zh: "2025，你在关系里理性和责任感很强，重承诺、重实际，有时却容易忽略情绪层面的表达。2026，整体能量夹杂温暖与小考验：有贵人、有好缘分，但也容易因为说话太直接，引发误会或争执。越在乎的人，越要记得“先照顾对方的感受，再表达自己的观点”。",
                en: "In 2025, you were rational and responsible but ignored emotions. 2026 mixes warmth and tests: nobles and good fate exist, but blunt words may cause conflict. Care for feelings before expressing views to those you value."
            },
            wealth: {
                zh: "2025，你在金钱上偏向谨慎，有计划、有节制。2026，财运有机会向好发展，但同时也有“说错话得罪人、影响合作或资源”的风险。只要在关键场合保持专业与谦逊，你原本的认真细致就会自然转化成收入与机会。",
                en: "In 2025, you were cautious with money. 2026 looks good, but beware of offending people and affecting resources. Professionalism and humility will turn your diligence into income."
            },
            health: {
                zh: "2025，压力多半来自自己给自己的要求：要把事情做到最好，要兼顾所有人。2026，健康上要特别留意情绪累积带来的影响。学会不把所有事都追到极致，给自己一点犯错空间，身体才不需要用小毛病来提醒你“该停一停了”。",
                en: "In 2025, pressure came from self-imposed perfectionism. 2026 requires watching emotional accumulation. Don't chase perfection; give yourself room to err, so your body doesn't have to stop you with ailments."
            },
            career: {
                zh: "2025，你在职场的表现稳定可靠，是很多人眼中的“可以放心交给你”的那个人。2026，整体趋势是“有惊无险”：会有麻烦、也有贵人。只要你不被短期情绪带着起伏，对于职业形象的长期经营，这一年其实是加分的。记得少一点争对错，多一点解决问题。",
                en: "In 2025, you were reliable. 2026 is 'safe despite scares': troubles and nobles co-exist. Don't let emotions sway you. Long-term career image will improve. Argue less about right/wrong, solve more problems."
            },
            luck: {
                zh: "2025，是在细节里悄悄攒运气的一年；2026，是“遇事不慌，就能逢凶化吉”的一年。你越温和、越真诚，越容易在关键时刻得到别人伸出的一只手。",
                en: "2025 was saving luck in details; 2026 is 'calmness brings good fortune'. Gentleness and sincerity will bring help in critical moments."
            }
        }
    },
    Dog: {
        icon: "🐶",
        name: { zh: "狗", en: "Dog" },
        intro: {
            zh: "亲爱的你：你真诚、有原则，很重视“对还是错”。过去一年像是在收获努力的果实，而新的一年，则更像是在“高光中继续稳住自己”。",
            en: "Dear you: You are sincere, principled, and value right vs wrong. The past year was harvesting; the new year is 'staying steady in the spotlight'."
        },
        sections: {
            love: {
                zh: "2025，你在感情里的状态整体不错，有机会体验到“被看见、被珍惜”的温暖。2026，情感运势依然亮眼，不少资料都提到：这是一年“事业与感情双丰收”的能量，只是要小心因为太忙、太自信，而忽略了对方的感受。记得在所有风光时刻里，留一块位置给那个始终站在你这边的人。",
                en: "In 2025, relationships were warm. 2026 is bright, promising 'career and love success'. But don't ignore your partner due to busyness or overconfidence. Save a spot in your glory for those who stood by you."
            },
            wealth: {
                zh: "2025，是你看得到成果的一年，努力和回报的对应度，比以前更高。2026，正财偏财都有发挥空间，只要你守住底线、不盲目扩张，财运容易一路向上。唯一需要注意的，是别因为连胜几次就减少基本的谨慎——越是顺的时候，越要记得替自己留后路。",
                en: "In 2025, effort matched reward. 2026 offers wealth potential if you keep boundaries and don't expand blindly. Don't lose caution after wins—leave a way out even when things go smoothly."
            },
            health: {
                zh: "2025，你整体状态不错，就是容易在忙碌中忽略休息细节。2026，需留心突发的小意外与过劳带来的身体紧绷。把安全和休息当成不可妥协的底线，能让你在好年份里，既拿到成绩，也保住健康。",
                en: "In 2025, you ignored rest. 2026 requires caution against accidents and overwork. Make safety and rest non-negotiable to keep health while achieving results."
            },
            career: {
                zh: "2025，你在职场中已经有“被肯定”的迹象，有些人开始主动来找你合作。2026，是很适合“往上走一阶”的一年：更有责任、更大的舞台、更广的人脉。你要做的，是保持谦逊，别因为一时的掌声而远离了当初那份认真和踏实。",
                en: "In 2025, you were affirmed. 2026 is for 'stepping up': more responsibility, bigger stage. Stay humble and don't let applause distance you from your diligence."
            },
            luck: {
                zh: "2025，像是帮你把门打开的一年；2026，则像是邀请你从门里走出去的一年。请勇敢一点对自己说：“我配得上更大的舞台。”当你敢站出去，运气就会继续推你往前。",
                en: "2025 opened the door; 2026 invites you out. Boldly say: 'I deserve a bigger stage.' Dare to stand out, and luck will push you forward."
            }
        }
    },
    Pig: {
        icon: "🐷",
        name: { zh: "猪", en: "Pig" },
        intro: {
            zh: "亲爱的你：你温厚、重情，也很懂得享受生活中的小幸福。过去一年像是在适应变化，而新的一年，则更像“终于轮到你扬眉吐气”。",
            en: "Dear you: You are warm, sentimental, and enjoy small happiness. The past year was adapting; the new year is 'finally your time to shine'."
        },
        sections: {
            love: {
                zh: "2025，你在感情和人际上，有不少新体验、新场景，心也跟着被打开一点。2026，很多资料都直接点名：这是对你特别友善的一年，整体能量强、喜事机会多。无论是稳定关系的深化，还是开启一段新缘分，都更容易出现“顺着走就很好”的感觉。你只要保持真诚，不需要刻意表现，幸福感就会不请自来。",
                en: "In 2025, you had new experiences. 2026 is especially friendly: strong energy, many happy events. Relationships deepen or start smoothly. Just be sincere; happiness will come uninvited."
            },
            wealth: {
                zh: "2025，你可能开始尝试一些新方向，例如换工作、换城市、换合作方式，收入结构也有变化的倾向。2026，对金钱而言，是收成＋放大的年份：工作表现、贵人助力，都会带来明显的提升机会。唯一要注意的，就是避免因为“终于宽裕了”而放飞自我——适度享受可以，但别把未来的安全感透支太多。",
                en: "In 2025, you tried new directions. 2026 is 'harvest + amplification': performance and nobles bring improvement. Avoid overindulgence due to newfound wealth—don't overdraw future security."
            },
            health: {
                zh: "2025，你在适应变化的过程中，情绪与体力都有一点起伏。2026，整体状态比去年轻松许多，只要保持作息大致规律，不故意消耗自己，身体会很配合你。偶尔给自己安排一点“真正放空”的时刻，不带罪恶感地休息，你会发现自己越来越有精神。",
                en: "In 2025, you had ups and downs. 2026 is easier. Keep regular hours and don't exhaust yourself. Schedule guilt-free 'spacing out' moments to recharge."
            },
            career: {
                zh: "2025，是一个「尝试+过渡」的年份，你在职业路线上开始思考“我真正想过怎样的生活”。2026，是很适合你大胆发光的一年：表现空间多、被肯定的机会也多。只要你愿意比以前再主动半步——愿意提案、愿意争取、愿意站到前面——很多好消息会因你的一句“我可以试试”而发生。",
                en: "2025 was transition. 2026 is for shining: more space, more affirmation. Take a half-step forward—propose, strive, stand in front—and good news will follow."
            },
            luck: {
                zh: "2025，是暖场；2026，是“真正扬眉吐气的一年”。请认真地在心里种下一句暗示：> “这一年，轮到幸运喜欢我了。”当你用这样的信念去看待生活，它就会在细节里不断给你回应：好消息、好合作、好缘分，会一件件走进来。",
                en: "2025 was the warm-up; 2026 is your time. Plant this suggestion: 'This year, luck likes me.' With this belief, life will respond with good news, cooperation, and fate."
            }
        }
    }
};

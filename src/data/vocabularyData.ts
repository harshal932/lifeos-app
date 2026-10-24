import type { VocabWord, VocabDifficulty } from '../types';

interface RawVocabItem {
  id: string;
  word: string;
  partOfSpeech: string;
  simpleMeaning: string;
  marathiMeaning: string;
  pronunciation: string;
  difficulty: VocabDifficulty;
  examples: Array<{ english: string; marathi: string }>;
  synonyms: string[];
  antonyms: string[];
}

const RAW_DATASET: RawVocabItem[] = [
  // --- BEGINNER (1 to 35) ---
  {
    id: 'v-1',
    word: 'Abandon',
    partOfSpeech: 'verb',
    simpleMeaning: 'To leave behind or stop doing something completely',
    marathiMeaning: 'सोडून देणे / त्याग करणे',
    pronunciation: '/əˈbæn.dən/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'They had to abandon their car in the heavy snow.',
        marathi: 'त्यांना मुसळधार बर्फवृष्टीत आपली गाडी सोडून द्यावी लागली.'
      },
      {
        english: 'Do not abandon your dreams when challenges arise.',
        marathi: 'अडचणी आल्या तरी आपल्या स्वप्नांचा त्याग करू नका.'
      }
    ],
    synonyms: ['Leave', 'Desert', 'Quit', 'Relinquish'],
    antonyms: ['Keep', 'Maintain', 'Retain', 'Continue']
  },
  {
    id: 'v-2',
    word: 'Achieve',
    partOfSpeech: 'verb',
    simpleMeaning: 'To successfully reach a goal through effort',
    marathiMeaning: 'साध्य करणे / मिळवणे',
    pronunciation: '/əˈtʃiːv/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'She worked tirelessly to achieve high marks in her exam.',
        marathi: 'परीक्षेत उत्तम गुण मिळवण्यासाठी तिने अथक परिश्रम केले.'
      },
      {
        english: 'With consistent discipline, you can achieve any goal.',
        marathi: 'सततच्या शिस्तीने तुम्ही कोणतेही ध्येय साध्य करू शकता.'
      }
    ],
    synonyms: ['Accomplish', 'Attain', 'Fulfill', 'Reach'],
    antonyms: ['Fail', 'Lose', 'Surrender', 'Give up']
  },
  {
    id: 'v-3',
    word: 'Adapt',
    partOfSpeech: 'verb',
    simpleMeaning: 'To adjust or change to suit new conditions',
    marathiMeaning: 'जुळवून घेणे / परिस्थितीशी सुसंगत होणे',
    pronunciation: '/əˈdæpt/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Animals adapt to seasonal changes to survive.',
        marathi: 'जीवंत राहण्यासाठी प्राणी ऋतूतील बदलांशी जुळवून घेतात.'
      },
      {
        english: 'It took him a few weeks to adapt to the new college environment.',
        marathi: 'नवीन कॉलेजच्या वातावरणाशी जुळवून घ्यायला त्याला काही आठवडे लागले.'
      }
    ],
    synonyms: ['Adjust', 'Modify', 'Accommodate', 'Acclimate'],
    antonyms: ['Resist', 'Remain', 'Disobey']
  },
  {
    id: 'v-4',
    word: 'Beneficial',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Helpful, useful, or producing good results',
    marathiMeaning: 'फायदेशीर / लाभदायक',
    pronunciation: '/ˌben.ɪˈfɪʃ.əl/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Regular morning exercise is beneficial for heart health.',
        marathi: 'नियमित सकाळचा व्यायाम हृदयाच्या आरोग्यासाठी फायदेशीर असतो.'
      },
      {
        english: 'Reading technical documentation is beneficial for your career.',
        marathi: 'तांत्रिक माहिती वाचणे तुमच्या करिअरसाठी लाभदायक आहे.'
      }
    ],
    synonyms: ['Helpful', 'Advantageous', 'Favorable', 'Useful'],
    antonyms: ['Harmful', 'Detrimental', 'Disadvantageous', 'Damaging']
  },
  {
    id: 'v-5',
    word: 'Courage',
    partOfSpeech: 'noun',
    simpleMeaning: 'The ability to do something difficult without fear',
    marathiMeaning: 'धैर्य / हिम्मत',
    pronunciation: '/ˈkʌr.ɪdʒ/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'It takes courage to speak the truth in front of everyone.',
        marathi: 'सर्वांसमोर खरे बोलण्यासाठी धैर्य लागते.'
      },
      {
        english: 'She gathered the courage to start her own business.',
        marathi: 'तिने स्वतःचा व्यवसाय सुरू करण्याचे धैर्य दाखवले.'
      }
    ],
    synonyms: ['Bravery', 'Valor', 'Fearlessness', 'Grit'],
    antonyms: ['Cowardice', 'Timidness', 'Fear']
  },
  {
    id: 'v-6',
    word: 'Determined',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Having made a firm decision and being resolved not to change it',
    marathiMeaning: 'दृढनिश्चयी / ठाम',
    pronunciation: '/dɪˈtɜː.mɪnd/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'He is determined to master software development this year.',
        marathi: 'या वर्षी सॉफ्टवेअर डेव्हलपमेंटमध्ये प्रभुत्व मिळवण्याचा त्याचा दृढनिश्चय आहे.'
      },
      {
        english: 'A determined student can overcome any academic difficulty.',
        marathi: 'दृढनिश्चयी विद्यार्थी कोणत्याही शैक्षणिक अडचणीवर मात करू शकतो.'
      }
    ],
    synonyms: ['Resolute', 'Steadfast', 'Purposeful', 'Persistent'],
    antonyms: ['Hesitant', 'Undecided', 'Irresolute', 'Weak']
  },
  {
    id: 'v-7',
    word: 'Diligent',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Showing steady and earnest care in doing one’s work',
    marathiMeaning: 'मेहनती / उद्योगी / कर्तव्यदक्ष',
    pronunciation: '/ˈdɪl.ɪ.dʒənt/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'The diligent programmer solved the critical bug overnight.',
        marathi: 'मेहनती प्रोग्रामरने रात्रीतून ती गंभीर चूक दुरुस्त केली.'
      },
      {
        english: 'She was rewarded for her diligent research on the project.',
        marathi: 'प्रकल्पावरील तिच्या कर्तव्यदक्ष संशोधनाबद्दल तिला बक्षीस देण्यात आले.'
      }
    ],
    synonyms: ['Hardworking', 'Assiduous', 'Conscientious', 'Attentive'],
    antonyms: ['Lazy', 'Careless', 'Negligent', 'Idle']
  },
  {
    id: 'v-8',
    word: 'Efficient',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Working in a well-organized and competent way without wasting time or energy',
    marathiMeaning: 'कार्यक्षम / कुशल',
    pronunciation: '/ɪˈfɪʃ.ənt/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'The new search algorithm is much more efficient than the old one.',
        marathi: 'नवीन सर्च अल्गोरिदम जुन्या अल्गोरिदमपेक्षा अधिक कार्यक्षम आहे.'
      },
      {
        english: 'LifeOS helps you maintain an efficient daily routine.',
        marathi: 'LifeOS तुम्हाला कार्यक्षम दैनंदिन दिनचर्या राखण्यात मदत करते.'
      }
    ],
    synonyms: ['Effective', 'Productive', 'Capable', 'Resourceful'],
    antonyms: ['Inefficient', 'Wasteful', 'Incompetent']
  },
  {
    id: 'v-9',
    word: 'Generous',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Willing to give money, help, or kindness freely',
    marathiMeaning: 'उदार / दानशूर',
    pronunciation: '/ˈdʒen.ər.əs/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'He made a generous donation to the student scholarship fund.',
        marathi: 'त्याने विद्यार्थी शिष्यवृत्ती निधीसाठी उदार देणगी दिली.'
      },
      {
        english: 'She is always generous with her time when mentoring juniors.',
        marathi: 'ज्युनियर्सना मार्गदर्शन करताना ती नेहमी मोकळेपणाने वेळ देते.'
      }
    ],
    synonyms: ['Charitable', 'Benevolent', 'Magnanimous', 'Openhanded'],
    antonyms: ['Stingy', 'Selfish', 'Miserly', 'Greedy']
  },
  {
    id: 'v-10',
    word: 'Grateful',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Feeling or showing an appreciation of kindness; thankful',
    marathiMeaning: 'कृतज्ञ / आभारी',
    pronunciation: '/ˈɡreɪt.fəl/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'I am deeply grateful for your continuous guidance.',
        marathi: 'तुमच्या सततच्या मार्गदर्शनाबद्दल मी मनापासून आभारी आहे.'
      },
      {
        english: 'Writing a daily gratitude journal makes you feel grateful.',
        marathi: 'दररोज कृतज्ञता डायरी लिहिल्याने मनाला शांतता व समाधान मिळते.'
      }
    ],
    synonyms: ['Thankful', 'Appreciative', 'Obliged'],
    antonyms: ['Ungrateful', 'Unthankful', 'Heedless']
  },
  {
    id: 'v-11',
    word: 'Improve',
    partOfSpeech: 'verb',
    simpleMeaning: 'To make or become better',
    marathiMeaning: 'सुधारणे / प्रगती करणे',
    pronunciation: '/ɪmˈpruːv/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Daily practice will improve your English vocabulary.',
        marathi: 'दररोजच्या सरावाने तुमचे इंग्रजी शब्दभांडार सुधारेल.'
      },
      {
        english: 'He analyzed his test mistakes to improve his rank.',
        marathi: 'आपला क्रमांक सुधारण्यासाठी त्याने चाचणीतील चुकांचे विश्लेषण केले.'
      }
    ],
    synonyms: ['Enhance', 'Upgrade', 'Refine', 'Better'],
    antonyms: ['Worsen', 'Deteriorate', 'Degrade']
  },
  {
    id: 'v-12',
    word: 'Inspire',
    partOfSpeech: 'verb',
    simpleMeaning: 'To fill someone with the urge or ability to do something creative',
    marathiMeaning: 'प्रेरणा देणे / स्फूर्ती देणे',
    pronunciation: '/ɪnˈspaɪər/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Great teachers inspire students to think critically.',
        marathi: 'उत्कृष्ट शिक्षक विद्यार्थ्यांना सखोल विचार करण्याची प्रेरणा देतात.'
      },
      {
        english: 'His relentless discipline inspired the whole team.',
        marathi: 'त्याच्या अविश्रांत शिस्तीने संपूर्ण टीमला प्रेरणा दिली.'
      }
    ],
    synonyms: ['Motivate', 'Encourage', 'Stimulate', 'Arouse'],
    antonyms: ['Discourage', 'Dissuade', 'Depress']
  },
  {
    id: 'v-13',
    word: 'Modest',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Not boasting; humble in estimating one’s abilities',
    marathiMeaning: 'नम्र / साधे / विनयशील',
    pronunciation: '/ˈmɒd.ɪst/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Despite winning first prize, he remained very modest.',
        marathi: 'पहिले बक्षीस जिंकूनही तो अत्यंत नम्र राहिला.'
      },
      {
        english: 'They live in a modest house on the outskirts of the town.',
        marathi: 'ते शहराच्या बाहेरील एका साध्या घरात राहतात.'
      }
    ],
    synonyms: ['Humble', 'Unpretentious', 'Simple', 'Discreet'],
    antonyms: ['Arrogant', 'Boastful', 'Proud', 'Conceited']
  },
  {
    id: 'v-14',
    word: 'Opportunity',
    partOfSpeech: 'noun',
    simpleMeaning: 'A set of circumstances that makes it possible to do something',
    marathiMeaning: 'संधी / सुवर्णसंधी',
    pronunciation: '/ˌɒp.əˈtʃuː.nə.ti/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'College internships offer a great opportunity to gain practical skills.',
        marathi: 'कॉलेज इंटर्नशिप्स प्रात्यक्षिक कौशल्ये मिळवण्याची उत्तम संधी देतात.'
      },
      {
        english: 'Do not let this golden opportunity slip away.',
        marathi: 'ही सुवर्णसंधी हातची जाऊ देऊ नका.'
      }
    ],
    synonyms: ['Chance', 'Opening', 'Prospect', 'Occasion'],
    antonyms: ['Obstacle', 'Misfortune', 'Closure']
  },
  {
    id: 'v-15',
    word: 'Patience',
    partOfSpeech: 'noun',
    simpleMeaning: 'The capacity to accept delay or suffering without getting angry',
    marathiMeaning: 'संयम / सहनशीलता / धीर',
    pronunciation: '/ˈpeɪ.ʃəns/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Learning a new spoken language demands steady patience.',
        marathi: 'नवीन भाषा शिकण्यासाठी सातत्यपूर्ण संयम आवश्यक असतो.'
      },
      {
        english: 'She handled the angry customer with admirable patience.',
        marathi: 'तिने रागावलेल्या ग्राहकाला कौतुकास्पद संयमाने हाताळले.'
      }
    ],
    synonyms: ['Tolerance', 'Endurance', 'Forbearance', 'Persistence'],
    antonyms: ['Impatience', 'Agitation', 'Intolerance']
  },
  {
    id: 'v-16',
    word: 'Reliable',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Consistently good in quality or performance; trustworthy',
    marathiMeaning: 'विश्वासार्ह / भरवशाचा',
    pronunciation: '/rɪˈlaɪ.ə.bəl/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'He is a reliable friend who always keeps his promises.',
        marathi: 'तो एक विश्वासार्ह मित्र आहे जो नेहमी आपली वचने पाळतो.'
      },
      {
        english: 'We need a reliable database system for our personal application.',
        marathi: 'आमच्या वैयक्तिक ॲप्लिकेशनसाठी आम्हाला विश्वासार्ह डेटाबेस प्रणाली हवी आहे.'
      }
    ],
    synonyms: ['Trustworthy', 'Dependable', 'Credible', 'Solid'],
    antonyms: ['Unreliable', 'Undependable', 'Deceptive']
  },
  {
    id: 'v-17',
    word: 'Sincere',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Free from pretense or deceit; proceeding from genuine feelings',
    marathiMeaning: 'प्रामाणिक / खरा / मनापासूनचा',
    pronunciation: '/sɪnˈsɪər/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Please accept my sincere apologies for the inadvertent delay.',
        marathi: 'अनपेक्षित उशिराबद्दल कृपया माझी प्रामाणिक माफी स्वीकारा.'
      },
      {
        english: 'Her sincere interest in community welfare won everyone’s respect.',
        marathi: 'समाजकल्याणातील तिच्या प्रामाणिक आवडीने सर्वांचा आदर मिळवला.'
      }
    ],
    synonyms: ['Genuine', 'Honest', 'Heartfelt', 'Candid'],
    antonyms: ['Insincere', 'Fake', 'Dishonest', 'Hypocritical']
  },
  {
    id: 'v-18',
    word: 'Thrive',
    partOfSpeech: 'verb',
    simpleMeaning: 'To grow or develop well; flourish vigorously',
    marathiMeaning: 'भरभराट होणे / भरभराटीस येणे',
    pronunciation: '/θraɪv/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Children thrive in an encouraging and positive home environment.',
        marathi: 'उत्साहवर्धक आणि सकारात्मक कौटुंबिक वातावरणात मुले उत्तमरीत्या वाढतात.'
      },
      {
        english: 'The young startup began to thrive after securing international clients.',
        marathi: 'आंतरराष्ट्रीय ग्राहक मिळाल्यानंतर नवीन स्टार्टअपची भरभराट होऊ लागली.'
      }
    ],
    synonyms: ['Flourish', 'Prosper', 'Bloom', 'Succeed'],
    antonyms: ['Fail', 'Struggle', 'Wither', 'Decline']
  },
  {
    id: 'v-19',
    word: 'Unique',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Being the only one of its kind; unlike anything else',
    marathiMeaning: 'अद्वितीय / एकमेवाद्वितीय',
    pronunciation: '/juːˈniːk/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Each individual has a unique perspective on life.',
        marathi: 'प्रत्येक व्यक्तीचा जीवनाकडे पाहण्याचा दृष्टिकोन अद्वितीय असतो.'
      },
      {
        english: 'The architectural design of the historic temple is completely unique.',
        marathi: 'त्या ऐतिहासिक मंदिराची वास्तुरचना पूर्णपणे अद्वितीय आहे.'
      }
    ],
    synonyms: ['Singular', 'Distinctive', 'Matchless', 'Rare'],
    antonyms: ['Common', 'Ordinary', 'Generic', 'Standard']
  },
  {
    id: 'v-20',
    word: 'Valuable',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Worth a great deal of money or having great usefulness',
    marathiMeaning: 'मौल्यवान / उपयुक्त',
    pronunciation: '/ˈvæl.jə.bəl/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Time is the most valuable resource you possess.',
        marathi: 'वेळ हे तुमच्याकडे असलेले सर्वात मौल्यवान साधन आहे.'
      },
      {
        english: 'The professor provided valuable feedback on my thesis draft.',
        marathi: 'प्राध्यापकांनी माझ्या प्रबंधावर उपयुक्त आणि मोलाचा अभिप्राय दिला.'
      }
    ],
    synonyms: ['Precious', 'Priceless', 'Beneficial', 'Invaluable'],
    antonyms: ['Worthless', 'Useless', 'Cheap']
  },
  {
    id: 'v-21',
    word: 'Wisdom',
    partOfSpeech: 'noun',
    simpleMeaning: 'The quality of having experience, knowledge, and good judgment',
    marathiMeaning: 'शहाणपण / बुद्धिमत्ता / विवेक',
    pronunciation: '/ˈwɪz.dəm/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'With age and varied life experiences comes true wisdom.',
        marathi: 'वय आणि जीवनातील विविध अनुभवांसोबत खरे शहाणपण येते.'
      },
      {
        english: 'She made financial decisions with remarkable wisdom.',
        marathi: 'तिने उल्लेखनीय विवेकाने आर्थिक निर्णय घेतले.'
      }
    ],
    synonyms: ['Sagacity', 'Insight', 'Prudence', 'Discernment'],
    antonyms: ['Folly', 'Stupidity', 'Ignorance']
  },
  {
    id: 'v-22',
    word: 'Balance',
    partOfSpeech: 'noun',
    simpleMeaning: 'An even distribution of weight or equilibrium between aspects',
    marathiMeaning: 'समतोल / संतुलन',
    pronunciation: '/ˈbæl.əns/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Maintaining work-life balance is essential for long-term happiness.',
        marathi: 'दीर्घकालीन आनंदासाठी काम आणि जीवन यात समतोल राखणे आवश्यक आहे.'
      },
      {
        english: 'LifeOS helps you keep a healthy balance between study and wellness.',
        marathi: 'LifeOS तुम्हाला अभ्यास आणि आरोग्य यामध्ये योग्य संतुलन राखण्यास मदत करते.'
      }
    ],
    synonyms: ['Equilibrium', 'Harmony', 'Stability'],
    antonyms: ['Imbalance', 'Instability', 'Asymmetry']
  },
  {
    id: 'v-23',
    word: 'Calm',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Not showing or feeling nervousness, anger, or excitement',
    marathiMeaning: 'शांत / संयमी',
    pronunciation: '/kɑːm/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Staying calm under pressure helps you find effective solutions.',
        marathi: 'दडपणाखाली शांत राहिल्याने प्रभावी उपाय शोधण्यात मदत होते.'
      },
      {
        english: 'The serene lake looked peaceful and calm at sunrise.',
        marathi: 'सूर्योदयाच्या वेळी ते रमणीय तळे अतिशय शांत आणि प्रसन्न दिसत होते.'
      }
    ],
    synonyms: ['Peaceful', 'Tranquil', 'Serene', 'Composed'],
    antonyms: ['Agitated', 'Anxious', 'Violent', 'Stormy']
  },
  {
    id: 'v-24',
    word: 'Curious',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Eager to know or learn something new',
    marathiMeaning: 'उत्सुक / जिज्ञासू',
    pronunciation: '/ˈkjʊə.ri.əs/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Curious minds always seek to understand how things work.',
        marathi: 'जिज्ञासू मने नेहमी गोष्टी कशा काम करतात हे जाणून घेण्याचा प्रयत्न करतात.'
      },
      {
        english: 'I am curious to learn more about automated software design.',
        marathi: 'ऑटोमेटेड सॉफ्टवेअर डिझाइनबद्दल अधिक जाणून घेण्यास मी उत्सुक आहे.'
      }
    ],
    synonyms: ['Inquisitive', 'Enquiring', 'Interested'],
    antonyms: ['Indifferent', 'Uninterested', 'Apathetic']
  },
  {
    id: 'v-25',
    word: 'Decade',
    partOfSpeech: 'noun',
    simpleMeaning: 'A period of ten consecutive years',
    marathiMeaning: 'दशक (१० वर्षांचा काळ)',
    pronunciation: '/ˈdek.eɪd/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Technology has revolutionized personal finance over the past decade.',
        marathi: 'गेल्या दशकात तंत्रज्ञानाने वैयक्तिक अर्थव्यवस्थेत क्रांती घडवून आणली आहे.'
      },
      {
        english: 'He spent nearly a decade perfecting his engineering expertise.',
        marathi: 'त्याने आपल्या अभियांत्रिकी कौशल्यात पारंगत होण्यासाठी जवळपास एक दशक घालवले.'
      }
    ],
    synonyms: ['Ten-year period', 'Decennium'],
    antonyms: []
  },
  {
    id: 'v-26',
    word: 'Enthusiastic',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Having or showing intense and eager enjoyment or interest',
    marathiMeaning: 'उत्साही / उत्सुक',
    pronunciation: '/ɪnˌθjuː.ziˈæs.tɪk/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'The audience gave an enthusiastic applause after the concert.',
        marathi: 'संगीताच्या कार्यक्रमानंतर प्रेक्षकांनी उत्साही टाळ्यांचा कडकडाट केला.'
      },
      {
        english: 'She is very enthusiastic about learning Marathi and English literature.',
        marathi: 'ती मराठी आणि इंग्रजी साहित्य शिकण्यासाठी अत्यंत उत्साही आहे.'
      }
    ],
    synonyms: ['Eager', 'Passionate', 'Zealous', 'Keen'],
    antonyms: ['Apathetic', 'Indifferent', 'Reluctant']
  },
  {
    id: 'v-27',
    word: 'Forgive',
    partOfSpeech: 'verb',
    simpleMeaning: 'To stop feeling angry or resentful towards someone for an offense',
    marathiMeaning: 'माफ करणे / क्षमा करणे',
    pronunciation: '/fəˈɡɪv/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Learning to forgive brings immense peace to your own heart.',
        marathi: 'माफ करायला शिकल्याने स्वतःच्या मनाला अथांग शांती मिळते.'
      },
      {
        english: 'She forgave her friend for making an honest mistake.',
        marathi: 'नकळत झालेल्या चुकीबद्दल तिने आपल्या मित्राला क्षमा केली.'
      }
    ],
    synonyms: ['Pardon', 'Excuse', 'Absolve', 'Condone'],
    antonyms: ['Blame', 'Punish', 'Resent', 'Accuse']
  },
  {
    id: 'v-28',
    word: 'Growth',
    partOfSpeech: 'noun',
    simpleMeaning: 'The process of developing or increasing in size or maturity',
    marathiMeaning: 'वाढ / प्रगती / विकास',
    pronunciation: '/ɡrəʊθ/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Consistent daily reading fosters remarkable intellectual growth.',
        marathi: 'दररोजच्या नियमित वाचनामुळे लक्षणीय बौद्धिक वाढ होते.'
      },
      {
        english: 'The economic growth of the region created thousands of new jobs.',
        marathi: 'भागाच्या आर्थिक विकासाने हजारो नवीन नोकऱ्या निर्माण केल्या.'
      }
    ],
    synonyms: ['Development', 'Expansion', 'Progress', 'Advancement'],
    antonyms: ['Decline', 'Shrinkage', 'Stagnation', 'Decay']
  },
  {
    id: 'v-29',
    word: 'Honest',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Free of deceit and untruthfulness; sincere',
    marathiMeaning: 'प्रामाणिक / खरा',
    pronunciation: '/ˈɒn.ɪst/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'An honest self-assessment helps you overcome personal weaknesses.',
        marathi: 'प्रामाणिक आत्मपरीक्षण तुम्हाला वैयक्तिक उणिवांवर मात करण्यास मदत करते.'
      },
      {
        english: 'We appreciated his honest feedback on our software interface.',
        marathi: 'आमच्या सॉफ्टवेअर इंटरफेसवरील त्याच्या प्रामाणिक अभिप्रायाची आम्ही प्रशंसा केली.'
      }
    ],
    synonyms: ['Truthful', 'Upright', 'Trustworthy', 'Frank'],
    antonyms: ['Dishonest', 'Deceptive', 'Corrupt']
  },
  {
    id: 'v-30',
    word: 'Journey',
    partOfSpeech: 'noun',
    simpleMeaning: 'An act of traveling from one place to another; life progression',
    marathiMeaning: 'प्रवास / वाटचाल',
    pronunciation: '/ˈdʒɜː.ni/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Mastering algorithmic problem solving is a rewarding journey.',
        marathi: 'अल्गोरिदम समस्येचे निराकरण शिकणे ही एक आनंददायी वाटचाल आहे.'
      },
      {
        english: 'Every long journey begins with a single bold step.',
        marathi: 'प्रत्येक मोठा प्रवास एका धाडसी पावलाने सुरू होतो.'
      }
    ],
    synonyms: ['Trip', 'Voyage', 'Expedition', 'Path'],
    antonyms: []
  },
  {
    id: 'v-31',
    word: 'Knowledge',
    partOfSpeech: 'noun',
    simpleMeaning: 'Facts, information, and skills acquired through experience or education',
    marathiMeaning: 'ज्ञान / माहिती',
    pronunciation: '/ˈnɒl.ɪdʒ/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Continuous learning expands your knowledge and self-confidence.',
        marathi: 'सतत शिकल्याने तुमचे ज्ञान आणि आत्मविश्वास वाढतो.'
      },
      {
        english: 'Knowledge applied with kindness changes lives.',
        marathi: 'सद्भावनेने वापरलेले ज्ञान लोकांचे जीवन बदलते.'
      }
    ],
    synonyms: ['Wisdom', 'Understanding', 'Expertise', 'Insight'],
    antonyms: ['Ignorance', 'Illiteracy', 'Inexperience']
  },
  {
    id: 'v-32',
    word: 'Leisure',
    partOfSpeech: 'noun',
    simpleMeaning: 'Free time spent away from work and business duties',
    marathiMeaning: 'फावला वेळ / फुरसत',
    pronunciation: '/ˈleʒ.ər/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'He enjoys gardening during his leisure hours on Sunday.',
        marathi: 'रविवारी फावल्या वेळेत त्याला बागकाम करायला आवडते.'
      },
      {
        english: 'Make time for restorative leisure to prevent burnout.',
        marathi: 'मानसिक थकवा टाळण्यासाठी विश्रांतीच्या फुरसतीसाठी वेळ काढा.'
      }
    ],
    synonyms: ['Spare time', 'Recreation', 'Relaxation'],
    antonyms: ['Work', 'Labor', 'Toil']
  },
  {
    id: 'v-33',
    word: 'Notice',
    partOfSpeech: 'verb',
    simpleMeaning: 'To become aware of something by seeing or hearing it',
    marathiMeaning: 'लक्षात येणे / जाणीव होणे',
    pronunciation: '/ˈnəʊ.tɪs/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Did you notice any improvement in your daily consistency?',
        marathi: 'तुमच्या दैनंदिन सातत्यामध्ये काही सुधारणा तुमच्या लक्षात आली का?'
      },
      {
        english: 'I noticed a small typo in the documentation and fixed it.',
        marathi: 'माहिती पुस्तिकेत एक छोटी चूक माझ्या लक्षात आली आणि मी ती दुरुस्त केली.'
      }
    ],
    synonyms: ['Observe', 'Detect', 'Perceive', 'Spot'],
    antonyms: ['Ignore', 'Overlook', 'Neglect']
  },
  {
    id: 'v-34',
    word: 'Polite',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Having or showing behavior that is respectful and considerate of other people',
    marathiMeaning: 'सभ्य / नम्र / सुसंस्कृत',
    pronunciation: '/pəˈlaɪt/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'It is always best to remain polite when communicating with clients.',
        marathi: 'ग्राहकांशी संवाद साधताना नेहमी नम्र राहणे उत्तम असते.'
      },
      {
        english: 'A polite greeting instantly creates a welcoming environment.',
        marathi: 'एक सभ्य अभिवादन तात्काळ आदरयुक्त आणि स्वागतशील वातावरण निर्माण करते.'
      }
    ],
    synonyms: ['Courteous', 'Civil', 'Respectful', 'Gracious'],
    antonyms: ['Rude', 'Impolite', 'Discourteous']
  },
  {
    id: 'v-35',
    word: 'Struggle',
    partOfSpeech: 'verb',
    simpleMeaning: 'To make forceful or violent efforts to get free of restraint or overcome difficulty',
    marathiMeaning: 'संघर्ष करणे / झगडणे',
    pronunciation: '/ˈstrʌɡ.əl/',
    difficulty: 'beginner',
    examples: [
      {
        english: 'Many students struggle initially with pointer concepts in C++.',
        marathi: 'अनेक विद्यार्थ्यांना सुरुवातीला C++ मधील पॉईंटर संकल्पना समजताना संघर्ष करावा लागतो.'
      },
      {
        english: 'Every struggle you endure builds inner resilience.',
        marathi: 'तुम्ही केलेला प्रत्येक संघर्ष तुमचे आंतरिक धैर्य वाढवतो.'
      }
    ],
    synonyms: ['Strive', 'Battle', 'Fight', 'Contend'],
    antonyms: ['Surrender', 'Yield', 'Succumb']
  },

  // --- INTERMEDIATE (36 to 75) ---
  {
    id: 'v-36',
    word: 'Accomplish',
    partOfSpeech: 'verb',
    simpleMeaning: 'To successfully complete or fulfill a task',
    marathiMeaning: 'पूर्ण करणे / पार पाडणे',
    pronunciation: '/əˈkʌm.plɪʃ/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'With planned prioritization, you can accomplish more each day.',
        marathi: 'योग्य नियोजनाने तुम्ही दररोज अधिक कामे पार पाडू शकता.'
      },
      {
        english: 'The engineering team accomplished the project deadline comfortably.',
        marathi: 'अभियांत्रिकी पथकाने प्रकल्पाची अंतिम मुदत सहज पूर्ण केली.'
      }
    ],
    synonyms: ['Achieve', 'Attain', 'Fulfill', 'Execute'],
    antonyms: ['Fail', 'Abandon', 'Neglect']
  },
  {
    id: 'v-37',
    word: 'Adequate',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Satisfactory or acceptable in quality or quantity',
    marathiMeaning: 'पुरेसा / योग्य',
    pronunciation: '/ˈæd.ə.kwət/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Make sure you get adequate sleep before the interview.',
        marathi: 'मुलाखतीपूर्वी तुम्हाला पुरेशी झोप मिळेल याची खात्री करा.'
      },
      {
        english: 'The emergency budget proved adequate for unexpected home repairs.',
        marathi: 'घराच्या अनपेक्षित दुरुस्तीसाठी आपत्कालीन बजेट पुरेसे ठरले.'
      }
    ],
    synonyms: ['Sufficient', 'Enough', 'Ample', 'Decent'],
    antonyms: ['Inadequate', 'Insufficient', 'Lacking']
  },
  {
    id: 'v-38',
    word: 'Anticipate',
    partOfSpeech: 'verb',
    simpleMeaning: 'To expect or predict that something will happen',
    marathiMeaning: 'अपेक्षा करणे / आधीच अंदाज बांधणे',
    pronunciation: '/ænˈtɪs.ɪ.peɪt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Good planners anticipate potential bottlenecks beforehand.',
        marathi: 'चांगले नियोजक संभाव्य अडचणींचा आधीच अंदाज बांधतात.'
      },
      {
        english: 'We anticipate a rapid rise in website traffic after the launch.',
        marathi: 'प्रक्षेपणानंतर वेबसाइटवरील लोकांच्या भेटींमध्ये मोठी वाढ होईल अशी आम्ही अपेक्षा करतो.'
      }
    ],
    synonyms: ['Expect', 'Foresee', 'Predict', 'Await'],
    antonyms: ['Doubt', 'Ignore', 'Overlook']
  },
  {
    id: 'v-39',
    word: 'Appreciate',
    partOfSpeech: 'verb',
    simpleMeaning: 'To recognize the full worth or value of something',
    marathiMeaning: 'कौतुक करणे / महत्त्व जाणणे',
    pronunciation: '/əˈpriː.ʃi.eɪt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'I truly appreciate your timely assistance during the deployment.',
        marathi: 'सॉफ्टवेअर डिप्लॉयमेंटदरम्यान केलेल्या वेळेवर मदतीबद्दल मी तुमचे मनापासून कौतुक करतो.'
      },
      {
        english: 'His property has appreciated significantly in value over the years.',
        marathi: 'गेल्या काही वर्षांत त्याच्या मालमत्तेच्या मूल्यात लक्षणीय वाढ झाली आहे.'
      }
    ],
    synonyms: ['Value', 'Cherish', 'Acknowledge', 'Praise'],
    antonyms: ['Depreciate', 'Disparage', 'Undervalue']
  },
  {
    id: 'v-40',
    word: 'Boundary',
    partOfSpeech: 'noun',
    simpleMeaning: 'A line that marks the limits of an area or acceptable behavior',
    marathiMeaning: 'मर्यादा / सीमा',
    pronunciation: '/ˈbaʊn.dər.i/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Setting clear boundaries protects your mental energy.',
        marathi: 'कामाच्या स्पष्ट मर्यादा आखल्याने तुमची मानसिक ऊर्जा सुरक्षित राहते.'
      },
      {
        english: 'The river forms the natural boundary between the two districts.',
        marathi: 'ती नदी दोन जिल्ह्यांमधील नैसर्गिक सीमा तयार करते.'
      }
    ],
    synonyms: ['Limit', 'Border', 'Perimeter', 'Threshold'],
    antonyms: ['Center', 'Inside']
  },
  {
    id: 'v-41',
    word: 'Collaborate',
    partOfSpeech: 'verb',
    simpleMeaning: 'To work jointly on an activity or project',
    marathiMeaning: 'सहकार्य करणे / एकत्र काम करणे',
    pronunciation: '/kəˈlæb.ə.reɪt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Software developers often collaborate using GitHub repositories.',
        marathi: 'सॉफ्टवेअर डेव्हलपर्स अनेकदा गिटहबचा वापर करून एकत्र काम करतात.'
      },
      {
        english: 'Researchers across multiple universities collaborated on the vaccine study.',
        marathi: 'अनेक विद्यापीठांतील संशोधकांनी लस संशोधनावर एकत्र काम केले.'
      }
    ],
    synonyms: ['Cooperate', 'Team up', 'Coordinate', 'Join forces'],
    antonyms: ['Compete', 'Oppose', 'Disregard']
  },
  {
    id: 'v-42',
    word: 'Comprehend',
    partOfSpeech: 'verb',
    simpleMeaning: 'To grasp mentally; understand fully',
    marathiMeaning: 'समजून घेणे / आकलन होणे',
    pronunciation: '/ˌkɒm.prɪˈhend/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'It was hard to comprehend the scale of the planetary system.',
        marathi: 'सूर्यमालेचा अवाढव्य विस्तार पूर्णपणे समजून घेणे कठीण होते.'
      },
      {
        english: 'Reading slowly helped him comprehend complex algorithmic ideas.',
        marathi: 'हळूहळू वाचल्याने त्याला क्लिष्ट अल्गोरिदम संकल्पनांचे आकलन होण्यास मदत झाली.'
      }
    ],
    synonyms: ['Understand', 'Grasp', 'Fathom', 'Perceive'],
    antonyms: ['Misunderstand', 'Misconceive', 'Mistake']
  },
  {
    id: 'v-43',
    word: 'Consistent',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Acting or done in the same way over time, especially so as to be fair or accurate',
    marathiMeaning: 'सातत्यपूर्ण / सुसंगत',
    pronunciation: '/kənˈsɪs.tənt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Consistent practice is far more effective than last-minute cramming.',
        marathi: 'शेवटच्या क्षणी घोकंपट्टी करण्यापेक्षा सातत्यपूर्ण सराव खूप जास्त परिणामकारक असतो.'
      },
      {
        english: 'His performance remained consistent throughout the tournament.',
        marathi: 'संपूर्ण स्पर्धेत त्याची कामगिरी सातत्यपूर्ण राहिली.'
      }
    ],
    synonyms: ['Constant', 'Steady', 'Uniform', 'Reliable'],
    antonyms: ['Inconsistent', 'Erratic', 'Unsteady']
  },
  {
    id: 'v-44',
    word: 'Crucial',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Decisive or critical, especially in the success or failure of something',
    marathiMeaning: 'अत्यंत महत्त्वाचा / निर्णायक',
    pronunciation: '/ˈkruː.ʃəl/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Validating user input is crucial for web application security.',
        marathi: 'वेब ॲप्लिकेशनच्या सुरक्षेसाठी वापरकर्त्याच्या इनपुटची पडताळणी अत्यंत महत्त्वाची असते.'
      },
      {
        english: 'The final five minutes of the match proved crucial for victory.',
        marathi: 'विजयासाठी सामन्याची शेवटची पाच मिनिटे अत्यंत निर्णायक ठरली.'
      }
    ],
    synonyms: ['Vital', 'Critical', 'Pivotal', 'Essential'],
    antonyms: ['Trivial', 'Minor', 'Insignificant', 'Optional']
  },
  {
    id: 'v-45',
    word: 'Demanding',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Requiring much time, effort, or careful attention',
    marathiMeaning: 'कठीण / भरपूर प्रयत्नांची अपेक्षा ठेवणारे',
    pronunciation: '/dɪˈmɑːn.dɪŋ/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Preparing for competitive engineering exams is a demanding endeavor.',
        marathi: 'स्पर्धा परीक्षांची तयारी करणे हा भरपूर मेहनत मागून घेणारा प्रयत्न आहे.'
      },
      {
        english: 'She handled a demanding work schedule while studying.',
        marathi: 'शिकत असताना तिने कामाचे कठीण वेळापत्रक उत्तम सांभाळले.'
      }
    ],
    synonyms: ['Challenging', 'Exacting', 'Rigorous', 'Tough'],
    antonyms: ['Easy', 'Effortless', 'Simple']
  },
  {
    id: 'v-46',
    word: 'Diverse',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Showing a great deal of variety; very different',
    marathiMeaning: 'विविध / बहुविध',
    pronunciation: '/daɪˈvɜːs/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'India has an extraordinarily diverse cultural landscape.',
        marathi: 'भारतामध्ये विलक्षण बहुविध सांस्कृतिक विविधता आहे.'
      },
      {
        english: 'The software team has engineers with diverse skill sets.',
        marathi: 'सॉफ्टवेअर टीममध्ये विविध कौशल्यांचे अभियंते आहेत.'
      }
    ],
    synonyms: ['Varied', 'Different', 'Assorted', 'Manifold'],
    antonyms: ['Uniform', 'Identical', 'Homogeneous']
  },
  {
    id: 'v-47',
    word: 'Empathy',
    partOfSpeech: 'noun',
    simpleMeaning: 'The ability to understand and share the feelings of another',
    marathiMeaning: 'सहानुभूती / दुसऱ्याच्या भावना समजून घेणे',
    pronunciation: '/ˈem.pə.θi/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'A great leader listens with genuine empathy.',
        marathi: 'एक महान नेता खऱ्या सहानुभूतीने आणि आपुलकीने ऐकतो.'
      },
      {
        english: 'Empathy in product design leads to more user-friendly applications.',
        marathi: 'उत्पादन रचनेत सहानुभूती असल्यामुळे वापरकर्त्यांना सोपी वाटणारी ॲप्स बनतात.'
      }
    ],
    synonyms: ['Compassion', 'Understanding', 'Sensitivity'],
    antonyms: ['Apathy', 'Callousness', 'Indifference']
  },
  {
    id: 'v-48',
    word: 'Enhance',
    partOfSpeech: 'verb',
    simpleMeaning: 'To intensify, increase, or further improve the quality or value',
    marathiMeaning: 'वाढवणे / अधिक सुधारणे',
    pronunciation: '/ɪnˈhɑːns/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Consistent vocabulary practice will enhance your communication skills.',
        marathi: 'नियमित शब्दसंग्रह सरावामुळे तुमचे संभाषण कौशल्य अधिक सुधारेल.'
      },
      {
        english: 'Adding dark mode enhances user comfort in low-light environments.',
        marathi: 'डार्क मोड जोडल्याने रात्रीच्या वेळी ॲप वापरणे अधिक सोयीचे होते.'
      }
    ],
    synonyms: ['Boost', 'Elevate', 'Enrich', 'Amplify'],
    antonyms: ['Diminish', 'Reduce', 'Weaken', 'Damage']
  },
  {
    id: 'v-49',
    word: 'Essential',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Absolutely necessary; extremely important',
    marathiMeaning: 'अत्यावश्यक / मूलभूत',
    pronunciation: '/ɪˈsen.ʃəl/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Exact financial arithmetic is essential for an expense tracker.',
        marathi: 'खर्च व्यवस्थापक ॲपसाठी पैशांची अचूक आकडेमोड अत्यावश्यक आहे.'
      },
      {
        english: 'Water and clean air are essential for all life forms.',
        marathi: 'पाणी आणि शुद्ध हवा सर्व सजीवांसाठी अत्यावश्यक आहेत.'
      }
    ],
    synonyms: ['Indispensable', 'Vital', 'Crucial', 'Fundamental'],
    antonyms: ['Optional', 'Secondary', 'Unnecessary']
  },
  {
    id: 'v-50',
    word: 'Feasible',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Possible to do easily or conveniently',
    marathiMeaning: 'शक्य / व्यवहार्य / साध्य',
    pronunciation: '/ˈfiː.zə.bəl/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Building an offline-first PWA is technically feasible with IndexedDB.',
        marathi: 'IndexedDB च्या साहाय्याने ऑफलाइन PWA बनवणे तांत्रिकदृष्ट्या सहज शक्य आहे.'
      },
      {
        english: 'Let us discuss whether completing this feature in two days is feasible.',
        marathi: 'हे फीचर दोन दिवसांत पूर्ण करणे व्यवहार्य आहे का यावर आपण चर्चा करू.'
      }
    ],
    synonyms: ['Viable', 'Workable', 'Achievable', 'Practicable'],
    antonyms: ['Infeasible', 'Impossible', 'Impractical']
  },
  {
    id: 'v-51',
    word: 'Fundamental',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Forming a necessary base or core; of central importance',
    marathiMeaning: 'मूलभूत / पायाभूत',
    pronunciation: '/ˌfʌn.dəˈmen.təl/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Data structures and algorithms are fundamental to computer science.',
        marathi: 'डेटा स्ट्रक्चर्स आणि अल्गोरिदम हे संगणक शास्त्राचे पायाभूत घटक आहेत.'
      },
      {
        english: 'Freedom of speech is a fundamental human right.',
        marathi: 'भाषण स्वातंत्र्य हा एक मूलभूत मानवी हक्क आहे.'
      }
    ],
    synonyms: ['Basic', 'Core', 'Elementary', 'Primary'],
    antonyms: ['Advanced', 'Peripheral', 'Superficial']
  },
  {
    id: 'v-52',
    word: 'Genuine',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Truly what something is said to be; authentic',
    marathiMeaning: 'खरा / अस्सल / प्रामाणिक',
    pronunciation: '/ˈdʒen.ju.ɪn/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'She felt a genuine sense of relief after passing the examination.',
        marathi: 'परीक्षेत उत्तीर्ण झाल्यानंतर तिला खरोखरच मनस्वी दिलासा वाटला.'
      },
      {
        english: 'Always make sure to purchase genuine spare parts.',
        marathi: 'नेहमी अस्सल सुटे भाग खरेदी करण्याची खात्री करा.'
      }
    ],
    synonyms: ['Authentic', 'Real', 'Legitimate', 'Sincere'],
    antonyms: ['Fake', 'Counterfeit', 'Spurious', 'Artificial']
  },
  {
    id: 'v-53',
    word: 'Hesitate',
    partOfSpeech: 'verb',
    simpleMeaning: 'To pause before saying or doing something through uncertainty',
    marathiMeaning: 'चरफडणे / कचरत राहणे / मागे-पुढे पाहणे',
    pronunciation: '/ˈhez.ɪ.teɪt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Do not hesitate to ask questions whenever you have doubts.',
        marathi: 'शंका आल्यावर प्रश्न विचारण्यास मुळीच संकोच करू नका.'
      },
      {
        english: 'She hesitated for a second before pressing the submit button.',
        marathi: 'सबमिट बटण दाबण्यापूर्वी ती एक सेकंद थबकली.'
      }
    ],
    synonyms: ['Pause', 'Falter', 'Waver', 'Vacillate'],
    antonyms: ['Proceed', 'Rush', 'Advance']
  },
  {
    id: 'v-54',
    word: 'Ignite',
    partOfSpeech: 'verb',
    simpleMeaning: 'To catch fire or cause something to catch fire; arouse passion',
    marathiMeaning: 'पेटवणे / चेतवणे / जागृत करणे',
    pronunciation: '/ɪɡˈnaɪt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'The inspiring talk ignited a deep passion for research in the students.',
        marathi: 'त्या प्रेरणादायी भाषणाने विद्यार्थ्यांमध्ये संशोधनाची आवड चेतवली.'
      },
      {
        english: 'A single spark can ignite a massive dry forest.',
        marathi: 'एक छोटी ठिणगी सुद्धा कोरड्या जंगलाला पेटवू शकते.'
      }
    ],
    synonyms: ['Kindle', 'Spark', 'Trigger', 'Arouse'],
    antonyms: ['Extinguish', 'Douse', 'Quench']
  },
  {
    id: 'v-55',
    word: 'Impressive',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Evoking admiration through size, quality, or skill',
    marathiMeaning: 'प्रभावशाली / वाखाणण्याजोगे',
    pronunciation: '/ɪmˈpres.ɪv/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Maintaining a 90-day habit streak is an impressive feat.',
        marathi: '९० दिवसांचे सवय सातत्य राखणे ही एक वाखाणण्याजोगी कामगिरी आहे.'
      },
      {
        english: 'The candidate gave an impressive presentation during the interview.',
        marathi: 'मुलाखतीत उमेदवाराने अत्यंत प्रभावी सादरीकरण केले.'
      }
    ],
    synonyms: ['Remarkable', 'Spectacular', 'Magnificent', 'Stunning'],
    antonyms: ['Mediocre', 'Ordinary', 'Unimpressive']
  },
  {
    id: 'v-56',
    word: 'Inevitable',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Certain to happen; unavoidable',
    marathiMeaning: 'अटळ / न टाळता येणारे',
    pronunciation: '/ɪnˈev.ɪ.tə.bəl/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Occasional setbacks are an inevitable part of learning.',
        marathi: 'काहीवेळा येणारे अपयश हा शिकण्याचा एक अटळ भाग असतो.'
      },
      {
        english: 'Technological disruption is inevitable in modern industries.',
        marathi: 'आधुनिक उद्योगांमध्ये तांत्रिक बदल अटळ आहेत.'
      }
    ],
    synonyms: ['Unavoidable', 'Inescapable', 'Destined', 'Sure'],
    antonyms: ['Avoidable', 'Preventable', 'Uncertain']
  },
  {
    id: 'v-57',
    word: 'Influence',
    partOfSpeech: 'noun',
    simpleMeaning: 'The capacity to have an effect on the character or behavior of someone',
    marathiMeaning: 'प्रभाव / वजन',
    pronunciation: '/ˈɪn.flu.əns/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Good habits have a profound influence on your daily productivity.',
        marathi: 'चांगल्या सवयींचा तुमच्या दैनंदिन कार्यक्षमतेवर खोल प्रभाव पडतो.'
      },
      {
        english: 'Her mentor had a lasting influence on her career path.',
        marathi: 'तिच्या करिअरच्या वाटचालीवर तिच्या मार्गदर्शकाचा कायमस्वरूपी प्रभाव राहिला.'
      }
    ],
    synonyms: ['Impact', 'Effect', 'Control', 'Leverage'],
    antonyms: ['Powerlessness', 'Weakness']
  },
  {
    id: 'v-58',
    word: 'Inquire',
    partOfSpeech: 'verb',
    simpleMeaning: 'To ask for information from someone',
    marathiMeaning: 'चौकशी करणे / विचारणे',
    pronunciation: '/ɪnˈkwaɪər/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'I called the college office to inquire about scholarship criteria.',
        marathi: 'शिष्यवृत्तीच्या अटींबद्दल चौकशी करण्यासाठी मी कॉलेजच्या कार्यालयात फोन केला.'
      },
      {
        english: 'Feel free to inquire if you need clarification on the quiz.',
        marathi: 'चाचणीबद्दल काही शंका असल्यास निसंकोचपणे विचारा.'
      }
    ],
    synonyms: ['Ask', 'Question', 'Investigate', 'Query'],
    antonyms: ['Answer', 'Reply', 'Respond']
  },
  {
    id: 'v-59',
    word: 'Maintain',
    partOfSpeech: 'verb',
    simpleMeaning: 'To cause or enable a condition or state of affairs to continue',
    marathiMeaning: 'राखणे / सांभाळणे / टिकवणे',
    pronunciation: '/meɪnˈteɪn/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'It is important to maintain clean coding practices throughout the codebase.',
        marathi: 'संपूर्ण कोडबेसमध्ये चांगल्या कोडिंग पद्धती राखणे महत्त्वाचे आहे.'
      },
      {
        english: 'He maintained his composure despite facing harsh criticism.',
        marathi: 'कडक टीकेला सामोरे जाऊनही त्याने आपला संयम टिकवून ठेवला.'
      }
    ],
    synonyms: ['Preserve', 'Sustain', 'Keep up', 'Uphold'],
    antonyms: ['Discontinue', 'Abandon', 'Neglect']
  },
  {
    id: 'v-60',
    word: 'Motivate',
    partOfSpeech: 'verb',
    simpleMeaning: 'To provide someone with a reason for doing something',
    marathiMeaning: 'प्रेरित करणे / हुरूप आणणे',
    pronunciation: '/ˈməʊ.tɪ.veɪt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Visual streak counters motivate users to stay committed to habits.',
        marathi: 'दृश्य स्वरूपातील स्ट्रीक काउंटर्स वापरकर्त्यांना सवयी टिकवून ठेवण्यास प्रेरित करतात.'
      },
      {
        english: 'Praise from colleagues motivated him to work even harder.',
        marathi: 'सहकाऱ्यांकडून मिळालेल्या कौतुकाने त्याला अधिक काम करण्यास प्रवृत्त केले.'
      }
    ],
    synonyms: ['Inspire', 'Stimulate', 'Drive', 'Encourage'],
    antonyms: ['Demotivate', 'Dampen', 'Dissuade']
  },
  {
    id: 'v-61',
    word: 'Navigate',
    partOfSpeech: 'verb',
    simpleMeaning: 'To plan and direct the course of a ship, vehicle, or complex situation',
    marathiMeaning: 'दिशा शोधणे / मार्ग काढणे',
    pronunciation: '/ˈnæv.ɪ.ɡeɪt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Mobile bottom navigation makes it easy to navigate between screens.',
        marathi: 'मोबाईल बॉटम नेव्हिगेशनमुळे विविध स्क्रीन्सदरम्यान वावरणे सोपे होते.'
      },
      {
        english: 'She skillfully navigated through difficult organizational challenges.',
        marathi: 'तिने संस्थेतील कठीण आव्हानांतून कौशल्याने मार्ग काढला.'
      }
    ],
    synonyms: ['Steer', 'Guide', 'Traverse', 'Maneuver'],
    antonyms: ['Get lost', 'Wander']
  },
  {
    id: 'v-62',
    word: 'Objective',
    partOfSpeech: 'noun',
    simpleMeaning: 'A thing aimed at or sought; a goal',
    marathiMeaning: 'उद्दिष्ट / ध्येय',
    pronunciation: '/əbˈdʒek.tɪv/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Our primary objective is to deliver a reliable, offline-first application.',
        marathi: 'एक विश्वासार्ह आणि ऑफलाइन चालणारे ॲप्लिकेशन देणे हे आमचे प्राथमिक उद्दिष्ट आहे.'
      },
      {
        english: 'Break your long-term goals into smaller weekly objectives.',
        marathi: 'तुमच्या दीर्घकालीन ध्येयांचे छोट्या साप्ताहिक उद्दिष्टांमध्ये विभाजन करा.'
      }
    ],
    synonyms: ['Goal', 'Target', 'Purpose', 'Aim'],
    antonyms: []
  },
  {
    id: 'v-63',
    word: 'Overcome',
    partOfSpeech: 'verb',
    simpleMeaning: 'To succeed in dealing with a problem or difficulty',
    marathiMeaning: 'मात करणे / विजय मिळवणे',
    pronunciation: '/ˌəʊ.vəˈkʌm/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'He practiced speaking daily to overcome his stage fright.',
        marathi: 'व्यासपीठाची भीती दूर करण्यासाठी त्याने रोज बोलण्याचा सराव केला.'
      },
      {
        english: 'With determination, we can overcome any technical hurdle.',
        marathi: 'दृढनिश्चयाने आपण कोणत्याही तांत्रिक अडचणीवर मात करू शकतो.'
      }
    ],
    synonyms: ['Conquer', 'Surmount', 'Defeat', 'Triumph over'],
    antonyms: ['Succumb', 'Surrender', 'Fail']
  },
  {
    id: 'v-64',
    word: 'Perceive',
    partOfSpeech: 'verb',
    simpleMeaning: 'To become aware or conscious of something; realize',
    marathiMeaning: 'जाणवणे / समजणे / आकलन होणे',
    pronunciation: '/pəˈsiːv/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Users immediately perceive whether an interface is fast and responsive.',
        marathi: 'वापरकर्त्यांना लगेच जाणवते की एखादा इंटरफेस जलद आहे की नाही.'
      },
      {
        english: 'He perceived a subtle change in his friend’s tone of voice.',
        marathi: 'मित्राच्या बोलण्यातील सूक्ष्म बदल त्याला जाणवला.'
      }
    ],
    synonyms: ['Discern', 'Recognize', 'Notice', 'Observe'],
    antonyms: ['Miss', 'Overlook', 'Disregard']
  },
  {
    id: 'v-65',
    word: 'Persistent',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Continuing firmly in a course of action in spite of difficulty',
    marathiMeaning: 'चिकाटी असलेला / चिवट',
    pronunciation: '/pəˈsɪs.tənt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Persistent effort is the true key to mastering English vocabulary.',
        marathi: 'इंग्रजी शब्दभांडार समृद्ध करण्यासाठी चिकाटीने केलेले प्रयत्न हीच खरी गुरुकिल्ली आहे.'
      },
      {
        english: 'The persistent rain caused water-logging across the city.',
        marathi: 'सतत पडणाऱ्या पावसामुळे शहरात जागोजागी पाणी साचले.'
      }
    ],
    synonyms: ['Tenacious', 'Persevering', 'Relentless', 'Steadfast'],
    antonyms: ['Fickle', 'Relenting', 'Hesitant']
  },
  {
    id: 'v-66',
    word: 'Potential',
    partOfSpeech: 'noun',
    simpleMeaning: 'Latent qualities or abilities that may be developed and lead to success',
    marathiMeaning: 'क्षमता / सुप्त ताकद',
    pronunciation: '/pəˈten.ʃəl/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'She has immense potential to become a lead software architect.',
        marathi: 'तिच्यात एक आघाडीचा सॉफ्टवेअर आर्किटेक्ट बनण्याची प्रचंड क्षमता आहे.'
      },
      {
        english: 'With proper guidance, every student can unlock their full potential.',
        marathi: 'योग्य मार्गदर्शनाने प्रत्येक विद्यार्थी आपली पूर्ण क्षमता सिद्ध करू शकतो.'
      }
    ],
    synonyms: ['Capability', 'Capacity', 'Possibility', 'Talent'],
    antonyms: ['Inability', 'Impotence', 'Weakness']
  },
  {
    id: 'v-67',
    word: 'Prioritize',
    partOfSpeech: 'verb',
    simpleMeaning: 'To designate or treat something as more important than other things',
    marathiMeaning: 'प्राधान्य देणे',
    pronunciation: '/praɪˈɒr.ɪ.taɪz/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Always prioritize high-impact tasks early in your day.',
        marathi: 'दिवसाच्या सुरुवातीला नेहमी जास्त महत्त्वाच्या कामांना प्राधान्य द्या.'
      },
      {
        english: 'LifeOS helps you prioritize urgent habits and financial goals.',
        marathi: 'LifeOS तुम्हाला महत्त्वाच्या सवयी आणि आर्थिक उद्दिष्टांना प्राधान्य देण्यास मदत करते.'
      }
    ],
    synonyms: ['Rank', 'Highlight', 'Order', 'Emphasize'],
    antonyms: ['Neglect', 'Deprioritize']
  },
  {
    id: 'v-68',
    word: 'Reassure',
    partOfSpeech: 'verb',
    simpleMeaning: 'To say or do something to remove doubts or fears',
    marathiMeaning: 'आश्वस्त करणे / धीर देणे',
    pronunciation: '/ˌriː.əˈʃɔːr/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'The doctor reassured the anxious patient that surgery was safe.',
        marathi: 'शस्त्रक्रिया सुरक्षित आहे अशी खात्री देत डॉक्टरांनी चिंताग्रस्त रुग्णाला धीर दिला.'
      },
      {
        english: 'Our transparent privacy policy reassures users about local data safety.',
        marathi: 'आमचे पारदर्शक गोपनीयता धोरण वापरकर्त्यांना स्थानिक डेटा सुरक्षेबद्दल आश्वस्त करते.'
      }
    ],
    synonyms: ['Comfort', 'Console', 'Encourage', 'Soothe'],
    antonyms: ['Alarm', 'Frighten', 'Unnerve']
  },
  {
    id: 'v-69',
    word: 'Resilient',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Able to withstand or recover quickly from difficult conditions',
    marathiMeaning: 'लवचिक / संकटातून लवकर सावरणारा',
    pronunciation: '/rɪˈzɪl.i.ənt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Resilient people adapt to sudden life changes with composure.',
        marathi: 'संकटातून सावरणारे लोक अचानक येणाऱ्या बदलांशी शांतपणे जुळवून घेतात.'
      },
      {
        english: 'We engineered a resilient offline database architecture.',
        marathi: 'आम्ही एक भक्कम आणि विश्वासार्ह ऑफलाइन डेटाबेस प्रणाली विकसित केली.'
      }
    ],
    synonyms: ['Tough', 'Hardy', 'Adaptable', 'Robust'],
    antonyms: ['Fragile', 'Vulnerable', 'Weak']
  },
  {
    id: 'v-70',
    word: 'Significant',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Sufficiently great or important to be worthy of attention',
    marathiMeaning: 'महत्त्वाचा / लक्षणीय',
    pronunciation: '/sɪɡˈnɪf.ɪ.kənt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'There is a significant improvement in your study focus this week.',
        marathi: 'या आठवड्यात तुमच्या अभ्यासाच्या एकाग्रतेत लक्षणीय सुधारणा झाली आहे.'
      },
      {
        english: 'The budget reduction resulted in significant savings over six months.',
        marathi: 'बजेट नियंत्रणामुळे सहा महिन्यांत मोठी आणि लक्षणीय बचत झाली.'
      }
    ],
    synonyms: ['Meaningful', 'Substantial', 'Major', 'Noteworthy'],
    antonyms: ['Insignificant', 'Minor', 'Trivial']
  },
  {
    id: 'v-71',
    word: 'Subtle',
    partOfSpeech: 'adjective',
    simpleMeaning: 'So delicate or precise as to be difficult to analyze or describe',
    marathiMeaning: 'सूक्ष्म / बारीक',
    pronunciation: '/ˈsʌt.əl/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'The interface uses subtle animations to delight users without clutter.',
        marathi: 'इंटरफेस वापरकर्त्यांना त्रास न देता प्रसन्न करण्यासाठी सूक्ष्म ॲनिमेशन्स वापरतो.'
      },
      {
        english: 'There was a subtle difference in meaning between the two words.',
        marathi: 'त्या दोन शब्दांच्या अर्थांमध्ये एक सूक्ष्म फरक होता.'
      }
    ],
    synonyms: ['Delicate', 'Understated', 'Fine', 'Nuanced'],
    antonyms: ['Obvious', 'Blatant', 'Harsh', 'Crude']
  },
  {
    id: 'v-72',
    word: 'Sufficient',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Enough; adequate for a particular purpose',
    marathiMeaning: 'पुरेसा / आवश्यक तेवढा',
    pronunciation: '/səˈfɪʃ.ənt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Two hours of deep study is sufficient to complete daily revisions.',
        marathi: 'दैनंदिन उजळणी पूर्ण करण्यासाठी दोन तासांचा एकाग्र अभ्यास पुरेसा आहे.'
      },
      {
        english: 'Ensure you have sufficient balance before initiating the transfer.',
        marathi: 'पैसे पाठवण्यापूर्वी खात्यात पुरेसे पैसे असल्याची खात्री करा.'
      }
    ],
    synonyms: ['Enough', 'Adequate', 'Ample'],
    antonyms: ['Insufficient', 'Deficient', 'Lacking']
  },
  {
    id: 'v-73',
    word: 'Tangible',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Perceptible by touch; clear and definite; real',
    marathiMeaning: 'मूर्त / प्रत्यक्ष / डोळ्यांना दिसणारा',
    pronunciation: '/ˈtæn.dʒə.bəl/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Tracking daily expenses produces tangible monthly savings.',
        marathi: 'दैनंदिन खर्चाची नोंद ठेवल्याने प्रत्यक्ष आणि डोळ्यांना दिसणारी मासिक बचत होते.'
      },
      {
        english: 'We need tangible proof before coming to any firm conclusion.',
        marathi: 'कोणत्याही ठाम निष्कर्षावर येण्यापूर्वी आपल्याला प्रत्यक्ष पुराव्याची गरज आहे.'
      }
    ],
    synonyms: ['Concrete', 'Real', 'Substantial', 'Palpable'],
    antonyms: ['Intangible', 'Abstract', 'Vague']
  },
  {
    id: 'v-74',
    word: 'Transparent',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Allowing light to pass through; open, frank, and easy to perceive',
    marathiMeaning: 'पारदर्शक / स्पष्ट',
    pronunciation: '/trænˈspær.ənt/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'A transparent organization fosters high trust among its employees.',
        marathi: 'पारदर्शक कामकाजामुळे संस्थेतील कर्मचाऱ्यांमध्ये मोठा विश्वास निर्माण होतो.'
      },
      {
        english: 'LifeOS has a completely transparent, client-side data architecture.',
        marathi: 'LifeOS ची डेटा रचना पूर्णपणे पारदर्शक आणि क्लायंट-साइड आहे.'
      }
    ],
    synonyms: ['Clear', 'Lucid', 'Open', 'Honest'],
    antonyms: ['Opaque', 'Deceptive', 'Cloudy']
  },
  {
    id: 'v-75',
    word: 'Venture',
    partOfSpeech: 'noun',
    simpleMeaning: 'A risky or daring journey or business undertaking',
    marathiMeaning: 'धाडसी उपक्रम / नवीन व्यवसाय',
    pronunciation: '/ˈven.tʃər/',
    difficulty: 'intermediate',
    examples: [
      {
        english: 'Starting an independent venture requires careful financial planning.',
        marathi: 'नवीन स्वतंत्र उपक्रम सुरू करण्यासाठी काळजीपूर्वक आर्थिक नियोजनाची गरज असते.'
      },
      {
        english: 'Their joint business venture proved remarkably successful in Mumbai.',
        marathi: 'त्यांचा संयुक्त व्यवसाय उपक्रम मुंबईत उल्लेखनीय यशस्वी ठरला.'
      }
    ],
    synonyms: ['Enterprise', 'Undertaking', 'Endeavor', 'Project'],
    antonyms: []
  },

  // --- ADVANCED (76 to 110) ---
  {
    id: 'v-76',
    word: 'Ambiguous',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Open to more than one interpretation; not having one obvious meaning',
    marathiMeaning: 'अस्पष्ट / संदिग्ध',
    pronunciation: '/æmˈbɪɡ.ju.əs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'The contract contained ambiguous phrasing that led to legal dispute.',
        marathi: 'करारामध्ये संदिग्ध शब्दरचना होती ज्यामुळे कायदेशीर वाद निर्माण झाला.'
      },
      {
        english: 'Clear documentation avoids ambiguous specifications for engineers.',
        marathi: 'स्पष्ट माहिती पत्रकामुळे अभियंत्यांसाठी संदिग्धता टळते.'
      }
    ],
    synonyms: ['Equivocal', 'Unclear', 'Obscure', 'Vague'],
    antonyms: ['Clear', 'Unambiguous', 'Definite', 'Explicit']
  },
  {
    id: 'v-77',
    word: 'Anomaly',
    partOfSpeech: 'noun',
    simpleMeaning: 'Something that deviates from what is standard, normal, or expected',
    marathiMeaning: 'विसंगती / अपवाद / अनियमितता',
    pronunciation: '/əˈnɒm.ə.li/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'The data analyst noticed an anomaly in yesterday’s transaction volume.',
        marathi: 'डेटा विश्लेषकाच्या कालच्या व्यवहारांच्या संख्येत एक विसंगती लक्षात आली.'
      },
      {
        english: 'Such unusually hot weather in December is an absolute climate anomaly.',
        marathi: 'डिसेंबरमधील असा प्रचंड उकाडा ही पूर्णपणे हवामानातील विसंगती आहे.'
      }
    ],
    synonyms: ['Abnormality', 'Irregularity', 'Oddity', 'Deviation'],
    antonyms: ['Normality', 'Standard', 'Regularity']
  },
  {
    id: 'v-78',
    word: 'Benevolent',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Well meaning and kindly; serving a charitable purpose',
    marathiMeaning: 'परोपकारी / दयाळू / हितचिंतक',
    pronunciation: '/bəˈnev.əl.ənt/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'The benevolent mentor funded education for underprivileged students.',
        marathi: 'त्या परोपकारी मार्गदर्शकाने गरजू विद्यार्थ्यांच्या शिक्षणाचा खर्च उचलला.'
      },
      {
        english: 'Her benevolent smile put everyone at ease instantly.',
        marathi: 'तिच्या दयाळू आणि प्रेमळ हास्याने सर्वांना धीर मिळाला.'
      }
    ],
    synonyms: ['Kind', 'Charitable', 'Magnanimous', 'Altruistic'],
    antonyms: ['Malevolent', 'Malicious', 'Cruel']
  },
  {
    id: 'v-79',
    word: 'Candor',
    partOfSpeech: 'noun',
    simpleMeaning: 'The quality of being open, honest, and straightforward in speech',
    marathiMeaning: 'स्पष्टवक्तेपणा / प्रामाणिकपणा',
    pronunciation: '/ˈkæn.dər/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'We appreciated the manager’s candor during the performance review.',
        marathi: 'कामगिरीच्या आढाव्यात व्यवस्थापकाच्या स्पष्टवक्तेपणाचे आम्ही कौतुक केले.'
      },
      {
        english: 'Speaking with candor helps build lasting professional trust.',
        marathi: 'मोकळेपणाने आणि प्रामाणिकपणे बोलल्याने दीर्घकालीन व्यावसायिक विश्वास निर्माण होतो.'
      }
    ],
    synonyms: ['Frankness', 'Honesty', 'Sincerity', 'Openness'],
    antonyms: ['Deceit', 'Insincerity', 'Artifice']
  },
  {
    id: 'v-80',
    word: 'Conscientious',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Wishing to do one’s work or duty thoroughly and correctly',
    marathiMeaning: 'कर्तव्यनिष्ठ / अत्यंत प्रामाणिक व दक्ष',
    pronunciation: '/ˌkɒn.ʃiˈen.ʃəs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'A conscientious developer tests edge cases thoroughly before deployment.',
        marathi: 'एक कर्तव्यनिष्ठ डेव्हलपर कोड रिलीज करण्यापूर्वी सर्व त्रुटी बारकाईने तपासतो.'
      },
      {
        english: 'She is a conscientious accountant who catches every discrepancy.',
        marathi: 'ती एक कर्तव्यदक्ष लेखापाल आहे जी प्रत्येक हिशेबातील तफावत अचूक शोधते.'
      }
    ],
    synonyms: ['Meticulous', 'Dutiful', 'Dedicated', 'Scrupulous'],
    antonyms: ['Careless', 'Irresponsible', 'Negligent']
  },
  {
    id: 'v-81',
    word: 'Cumulative',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Increasing or growing by successive additions',
    marathiMeaning: 'एकत्रित / संचित / क्रमशः वाढणारा',
    pronunciation: '/ˈkjuː.mjə.lə.tɪv/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'The cumulative effect of fifteen minutes of daily study is profound.',
        marathi: 'दररोज १५ मिनिटे अभ्यास करण्याचा एकत्रित परिणाम अत्यंत मोठा असतो.'
      },
      {
        english: 'Your monthly savings show the cumulative growth of small sacrifices.',
        marathi: 'तुमची मासिक बचत ही छोट्या बचतीची एकत्रित वाढ दर्शवते.'
      }
    ],
    synonyms: ['Aggregate', 'Accumulative', 'Collective'],
    antonyms: ['Decreasing', 'Subtracting']
  },
  {
    id: 'v-82',
    word: 'Eloquent',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Fluent or persuasive in speaking or writing',
    marathiMeaning: 'वक्तृत्वपूर्ण / प्रभावी बोलणारा / सुवक्ता',
    pronunciation: '/ˈel.ə.kwənt/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'He delivered an eloquent keynote address at the international conference.',
        marathi: 'त्याने आंतरराष्ट्रीय परिषदेत अत्यंत वक्तृत्वपूर्ण आणि प्रभावी भाषण दिले.'
      },
      {
        english: 'Her prose is praised for its eloquent and vivid descriptions.',
        marathi: 'तिच्या लेखनाची तिच्या प्रभावी व जिवंत वर्णनांसाठी प्रशंसा केली जाते.'
      }
    ],
    synonyms: ['Articulate', 'Expressive', 'Fluent', 'Silver-tongued'],
    antonyms: ['Inarticulate', 'Hesitant', 'Stammering']
  },
  {
    id: 'v-83',
    word: 'Ephemeral',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Lasting for a very short time; transitory',
    marathiMeaning: 'क्षणभंगुर / अल्पकाळ टिकणारे',
    pronunciation: '/ɪˈfem.ər.əl/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Fame on social media is often ephemeral and fades quickly.',
        marathi: 'सोशल मीडियावरील प्रसिद्धी अनेकदा क्षणभंगुर असते आणि पटकन नाहीशी होते.'
      },
      {
        english: 'Focus on lasting skills rather than chasing ephemeral trends.',
        marathi: 'क्षणभंगुर ट्रेंड्सच्या मागे लागण्यापेक्षा चिरंतन कौशल्यांवर लक्ष केंद्रित करा.'
      }
    ],
    synonyms: ['Transient', 'Fleeting', 'Short-lived', 'Brief'],
    antonyms: ['Permanent', 'Eternal', 'Enduring', 'Lasting']
  },
  {
    id: 'v-84',
    word: 'Exquisite',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Extremely beautiful and delicate; intensely felt',
    marathiMeaning: 'अत्यंत सुंदर / उत्कृष्ट / नक्षीदार',
    pronunciation: '/ɪkˈskwɪz.ɪt/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'The handwoven Paithani saree displayed exquisite craftsmanship.',
        marathi: 'हातमागावर विणलेल्या त्या पैठणी साडीत उत्कृष्ट कारागिरी दिसत होती.'
      },
      {
        english: 'The visual design of the mobile interface has exquisite typography.',
        marathi: 'मोबाईल इंटरफेसची रचना अत्यंत सुंदर आणि सुबक अक्षरांनी सजलेली आहे.'
      }
    ],
    synonyms: ['Splendid', 'Superb', 'Flawless', 'Elegant'],
    antonyms: ['Crude', 'Ugly', 'Flawed', 'Inferior']
  },
  {
    id: 'v-85',
    word: 'Fastidious',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Very attentive to and concerned about accuracy and detail',
    marathiMeaning: 'अतिचिकित्सक / बारकावे जपणारा',
    pronunciation: '/fæsˈtɪd.i.əs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'The fastidious editor reviewed every punctuation mark carefully.',
        marathi: 'अतिचिकित्सक संपादकाने प्रत्येक विरामचिन्ह काळजीपूर्वक तपासले.'
      },
      {
        english: 'He is fastidious about maintaining clean variable naming conventions.',
        marathi: 'व्हेरिएबल्सना अचूक नावे देण्याच्या बाबतीत तो अत्यंत काटेकोर आहे.'
      }
    ],
    synonyms: ['Meticulous', 'Punctilious', 'Perfectionist', 'Fussy'],
    antonyms: ['Careless', 'Sloppy', 'Lax']
  },
  {
    id: 'v-86',
    word: 'Gregarious',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Fond of company; sociable; living in flocks or communities',
    marathiMeaning: 'समाजप्रिय / मिळूनमिसळून राहणारा',
    pronunciation: '/ɡrɪˈɡeə.ri.əs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'His gregarious personality made him popular among university peers.',
        marathi: 'त्याच्या मिळूनमिसळून राहण्याच्या स्वभावामुळे तो विद्यापीठातील मित्रांमध्ये लोकप्रिय झाला.'
      },
      {
        english: 'Elephants are gregarious animals that travel in tight-knit herds.',
        marathi: 'हत्ती हे कळपात एकत्र मिळूनमिसळून राहणारे प्राणी आहेत.'
      }
    ],
    synonyms: ['Sociable', 'Outgoing', 'Companionable', 'Friendly'],
    antonyms: ['Solitary', 'Introverted', 'Reclusive', 'Antisocial']
  },
  {
    id: 'v-87',
    word: 'Impartial',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Treating all rivals or disputants equally; fair and unbiased',
    marathiMeaning: 'निःपक्षपाती / न्याय्य',
    pronunciation: '/ɪmˈpɑː.ʃəl/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'A judge must remain entirely impartial when weighing evidence.',
        marathi: 'पुरावे तपासताना न्यायाधीशाने पूर्णपणे निःपक्षपाती राहिले पाहिजे.'
      },
      {
        english: 'Our productivity insights provide an impartial evaluation of habits.',
        marathi: 'आमची प्रॉडक्टिव्हिटी सिस्टीम सवयींचे निःपक्षपाती मूल्यांकन देते.'
      }
    ],
    synonyms: ['Unbiased', 'Neutral', 'Equitable', 'Objective'],
    antonyms: ['Biased', 'Partial', 'Prejudiced']
  },
  {
    id: 'v-88',
    word: 'Inadvertent',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Not resulting from or achieved through deliberate planning; unintentional',
    marathiMeaning: 'नकळत झालेला / अनपेक्षित',
    pronunciation: '/ˌɪn.ədˈvɜː.tənt/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'The inadvertent deletion was restored quickly using the backup file.',
        marathi: 'नकळत डिलीट झालेली माहिती बॅकअप फाइलद्वारे लगेच पुनर्प्राप्त करण्यात आली.'
      },
      {
        english: 'I apologize for any inadvertent offense caused by my hasty remarks.',
        marathi: 'माझ्या घाईघाईत केलेल्या वक्तव्यामुळे नकळत दुखावले गेले असल्यास मी दिलगीर आहे.'
      }
    ],
    synonyms: ['Accidental', 'Unintended', 'Unwitting', 'Involuntary'],
    antonyms: ['Deliberate', 'Intentional', 'Planned']
  },
  {
    id: 'v-89',
    word: 'Inquisitive',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Curious or inquiring; eager to investigate and learn',
    marathiMeaning: 'चिकित्सक / सखोल चौकस',
    pronunciation: '/ɪnˈkwɪz.ɪ.tɪv/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'An inquisitive developer dissects library source code to understand its internals.',
        marathi: 'एक चिकित्सक डेव्हलपर लायब्ररी कशी काम करते हे समजून घेण्यासाठी त्याचा सोर्स कोड अभ्यासतो.'
      },
      {
        english: 'Children are naturally inquisitive about the wonders of nature.',
        marathi: 'मुले निसर्गातील चमत्कारांविषयी उपजतच अत्यंत चौकस असतात.'
      }
    ],
    synonyms: ['Curious', 'Probing', 'Investigative', 'Prying'],
    antonyms: ['Uninterested', 'Apathetic', 'Indifferent']
  },
  {
    id: 'v-90',
    word: 'Lucid',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Expressed clearly; easy to understand; bright or luminous',
    marathiMeaning: 'सुस्पष्ट / स्वच्छ / सहज समजणारे',
    pronunciation: '/ˈluː.sɪd/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'The author gave a lucid explanation of complex database indexing.',
        marathi: 'लेखकाने डेटाबेस इंडेक्सिंगच्या क्लिष्ट विषयाचे अत्यंत सुस्पष्ट स्पष्टीकरण दिले.'
      },
      {
        english: 'Even under fatigue, she presented a lucid summary of the project.',
        marathi: 'थकवा असतानाही तिने प्रकल्पाचा अत्यंत स्पष्ट आणि सुंदर सारांश मांडला.'
      }
    ],
    synonyms: ['Clear', 'Intelligible', 'Coherent', 'Transparent'],
    antonyms: ['Confusing', 'Obscure', 'Ambiguous', 'Muddled']
  },
  {
    id: 'v-91',
    word: 'Meticulous',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Showing great attention to detail; very careful and precise',
    marathiMeaning: 'अत्यंत सूक्ष्म / बारकाईने काम करणारा / काटेकोर',
    pronunciation: '/məˈtɪk.jə.ləs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'His meticulous financial bookkeeping ensured no rupee was unaccounted for.',
        marathi: 'त्याच्या अत्यंत काटेकोर आर्थिक नोंदींमुळे एकही रुपया हिशेबाशिवाय राहिला नाही.'
      },
      {
        english: 'The surgeon prepared for the intricate procedure with meticulous care.',
        marathi: 'शस्त्रक्रिया तज्ज्ञाने त्या गुंतागुंतीच्या प्रक्रियेसाठी काटेकोर पूर्वतयारी केली.'
      }
    ],
    synonyms: ['Thorough', 'Precise', 'Conscientious', 'Painstaking'],
    antonyms: ['Careless', 'Sloppy', 'Inaccurate']
  },
  {
    id: 'v-92',
    word: 'Nostalgia',
    partOfSpeech: 'noun',
    simpleMeaning: 'A sentimental longing or wistful affection for the past',
    marathiMeaning: 'भूतकाळातील आठवणींची ओढ / गतस्मृती',
    pronunciation: '/nɒsˈtæl.dʒə/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Hearing the old Marathi folk song evoked a deep sense of nostalgia.',
        marathi: 'ते जुने मराठी लोकगीत ऐकून जुन्या बालपणीच्या आठवणींची ओढ दाटून आली.'
      },
      {
        english: 'Visiting his childhood village filled him with warm nostalgia.',
        marathi: 'बालपणीच्या गावाला भेट दिल्यावर त्याचे मन गोड गतस्मृतींनी भरून आले.'
      }
    ],
    synonyms: ['Reminiscence', 'Yearning', 'Wistfulness'],
    antonyms: []
  },
  {
    id: 'v-93',
    word: 'Novice',
    partOfSpeech: 'noun',
    simpleMeaning: 'A person new to or inexperienced in a field or situation',
    marathiMeaning: 'नवशिका / नवशिकाऊ',
    pronunciation: '/ˈnɒv.ɪs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Even a novice can learn to build clean web applications with discipline.',
        marathi: 'एक नवशिकाऊ सुद्धा शिस्तीने उत्तम वेब ॲप्लिकेशन्स बनवायला शिकू शकतो.'
      },
      {
        english: 'The tutorial is carefully tailored for both novices and experts.',
        marathi: 'हे मार्गदर्शन नवशिक्यांसाठी तसेच तज्ज्ञांसाठीही उपयुक्त ठरेल असे बनवले आहे.'
      }
    ],
    synonyms: ['Beginner', 'Learner', 'Neophyte', 'Apprentice'],
    antonyms: ['Expert', 'Veteran', 'Professional']
  },
  {
    id: 'v-94',
    word: 'Oblivious',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Not aware of or not concerned about what is happening around one',
    marathiMeaning: 'बेफिकीर / अनभिज्ञ / गाफील',
    pronunciation: '/əˈblɪv.i.əs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'He was so absorbed in coding that he remained oblivious to the rain.',
        marathi: 'तो कोडिंगमध्ये इतका मग्न होता की बाहेर पडणाऱ्या पावसाची त्याला जाणीवच राहिली नाही.'
      },
      {
        english: 'Do not stay oblivious to your monthly spending patterns.',
        marathi: 'आपल्या महिन्याच्या खर्चाच्या पद्धतींकडे गाफील किंवा दुर्लक्षित राहू नका.'
      }
    ],
    synonyms: ['Unaware', 'Unconscious', 'Heedless', 'Blind'],
    antonyms: ['Aware', 'Mindful', 'Conscious', 'Attentive']
  },
  {
    id: 'v-95',
    word: 'Omniscient',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Knowing everything; having infinite awareness and understanding',
    marathiMeaning: 'सर्वज्ञ / सर्व जाणणारा',
    pronunciation: '/ɒmˈnɪs.i.ənt/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'The classic novel is narrated from an omniscient third-person viewpoint.',
        marathi: 'त्या प्रसिद्ध कादंबरीचे वर्णन एका सर्वज्ञ तृतीय-पुरुष दृष्टिकोनातून केले आहे.'
      },
      {
        english: 'No engineer is omniscient; continuous study is essential.',
        marathi: 'कोणताही अभियंता सर्वज्ञ नसतो; सतत अभ्यास करत राहणे गरजेचे आहे.'
      }
    ],
    synonyms: ['All-knowing', 'All-wise', 'Preeminent'],
    antonyms: ['Unknowing', 'Ignorant']
  },
  {
    id: 'v-96',
    word: 'Pragmatic',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Dealing with things sensibly and realistically based on practical conditions',
    marathiMeaning: 'व्यवहार्य / वास्तववादी',
    pronunciation: '/præɡˈmæt.ɪk/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Taking a pragmatic approach saved the engineering team weeks of rework.',
        marathi: 'वास्तववादी दृष्टिकोन स्वीकारल्याने इंजिनिअरिंग टीमचे कित्येक आठवड्यांचे श्रम वाचले.'
      },
      {
        english: 'He offered pragmatic financial advice tailored to my current income.',
        marathi: 'माझ्या सध्याच्या उत्पन्नाला साजेसा वास्तववादी आर्थिक सल्ला त्यांनी दिला.'
      }
    ],
    synonyms: ['Practical', 'Realistic', 'Sensible', 'Hard-headed'],
    antonyms: ['Idealistic', 'Impractical', 'Theoretical']
  },
  {
    id: 'v-97',
    word: 'Prolific',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Producing much fruit, foliage, or many intellectual works',
    marathiMeaning: 'विपुल लेखन किंवा निर्मिती करणारा / फलदायी',
    pronunciation: '/prəˈlɪf.ɪk/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Rabindranath Tagore was an exceptionally prolific writer and poet.',
        marathi: 'रवींद्रनाथ टागोर हे असामान्य विपुल निर्मिती करणारे लेखक आणि कवी होते.'
      },
      {
        english: 'A prolific programmer builds functional prototypes at remarkable speed.',
        marathi: 'एक कुशल व कार्यक्षम प्रोग्रामर वेगाने उपयुक्त सॉफ्टवेअर मॉडेल्स तयार करतो.'
      }
    ],
    synonyms: ['Productive', 'Fertile', 'Abundant', 'Creative'],
    antonyms: ['Unproductive', 'Barren', 'Sterile']
  },
  {
    id: 'v-98',
    word: 'Redundant',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Not or no longer needed or useful; superfluous',
    marathiMeaning: 'अनावश्यक / निरुपयोगी / अतिरिक्त',
    pronunciation: '/rɪˈdʌn.dənt/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Refactoring removed hundreds of lines of redundant legacy code.',
        marathi: 'कोड सुधारताना शेकडो ओळींचा अनावश्यक जुना कोड काढून टाकण्यात आला.'
      },
      {
        english: 'Automated tools have made manual paper calculations redundant.',
        marathi: 'ऑटोमेटेड साधनांनी कागदावरील जुनी आकडेमोड आता अनावश्यक बनवून टाकली आहे.'
      }
    ],
    synonyms: ['Superfluous', 'Unneeded', 'Excessive', 'Unnecessary'],
    antonyms: ['Essential', 'Necessary', 'Indispensable']
  },
  {
    id: 'v-99',
    word: 'Resolute',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Admirably purposeful, determined, and unwavering',
    marathiMeaning: 'अढळ / ठाम / निश्चयशील',
    pronunciation: '/ˈrez.ə.luːt/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'She remained resolute in her principles despite severe social pressure.',
        marathi: 'प्रचंड सामाजिक दबाव असतानाही ती आपल्या तत्त्वांवर अढळ राहिली.'
      },
      {
        english: 'A resolute mindset will carry you across the toughest career phases.',
        marathi: 'एक ठाम आणि निश्चयशील वृत्ती तुम्हाला करिअरमधील कठीण प्रसंगांतून पार पाडेल.'
      }
    ],
    synonyms: ['Determined', 'Unwavering', 'Steadfast', 'Firm'],
    antonyms: ['Irresolute', 'Wavering', 'Hesitant']
  },
  {
    id: 'v-100',
    word: 'Reticent',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Not revealing one’s thoughts or feelings readily',
    marathiMeaning: 'मितभाषी / अबोल / स्वतःचे विचार न मांडणारा',
    pronunciation: '/ˈret.ɪ.sənt/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'He was notoriously reticent about his personal achievements.',
        marathi: 'स्वतःच्या यशाबद्दल तो अत्यंत मितभाषी आणि अबोल राहण्यासाठी ओळखला जात असे.'
      },
      {
        english: 'She was reticent to express opinions before hearing all perspectives.',
        marathi: 'सर्वांचे म्हणणे ऐकण्यापूर्वी स्वतःचे मत मांडण्याबाबत ती सावध व अबोल राहिली.'
      }
    ],
    synonyms: ['Reserved', 'Taciturn', 'Secretive', 'Quiet'],
    antonyms: ['Frank', 'Garrulous', 'Outgoing', 'Vocal']
  },
  {
    id: 'v-101',
    word: 'Scrutinize',
    partOfSpeech: 'verb',
    simpleMeaning: 'To examine or inspect closely and thoroughly',
    marathiMeaning: 'सूक्ष्मपणे तपासणे / कसून तपासणी करणे',
    pronunciation: '/ˈskruː.tɪ.naɪz/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Security researchers scrutinize database queries for vulnerability bugs.',
        marathi: 'सुरक्षा संशोधक संभाव्य धोके टाळण्यासाठी डेटाबेसच्या नोंदींची सूक्ष्म तपासणी करतात.'
      },
      {
        english: 'The auditor scrutinized every monthly expense invoice.',
        marathi: 'हिशेब तपासनीसाने प्रत्येक महिन्याच्या खर्चाच्या बिलाची कसून तपासणी केली.'
      }
    ],
    synonyms: ['Inspect', 'Examine', 'Analyze', 'Audit'],
    antonyms: ['Glance', 'Skim', 'Overlook', 'Ignore']
  },
  {
    id: 'v-102',
    word: 'Serendipity',
    partOfSpeech: 'noun',
    simpleMeaning: 'The occurrence and development of events by chance in a happy or beneficial way',
    marathiMeaning: 'योगायोगाने झालेला अनपेक्षित लाभ / सुदैवी योगायोग',
    pronunciation: '/ˌser.ənˈdɪp.ə.ti/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Finding this comprehensive vocabulary guide was pure serendipity.',
        marathi: 'हे सर्वसमावेशक शब्दसंग्रह साधन सापडणे हा एक अत्यंत सुदैवी योगायोग होता.'
      },
      {
        english: 'Many scientific discoveries occurred through fortunate serendipity.',
        marathi: 'विज्ञानातील अनेक शोध हे सुदैवी योगायोगातून घडले आहेत.'
      }
    ],
    synonyms: ['Fluke', 'Chance', 'Good fortune', 'Coincidence'],
    antonyms: ['Bad luck', 'Misfortune']
  },
  {
    id: 'v-103',
    word: 'Spontaneous',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Performed or occurring as a result of a sudden impulse without premeditation',
    marathiMeaning: 'उत्स्फूर्त / तात्काळ घडणारा',
    pronunciation: '/spɒnˈteɪ.ni.əs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'The crowd burst into spontaneous celebration after the victory.',
        marathi: 'विजयानंतर जमावाने उत्स्फूर्त जल्लोष सुरू केला.'
      },
      {
        english: 'A spontaneous study break with friends refreshed his mind.',
        marathi: 'मित्रांसोबत घेतलेल्या एका उत्स्फूर्त सुट्टीने त्याचे मन ताजेतवाने झाले.'
      }
    ],
    synonyms: ['Impulsive', 'Unplanned', 'Natural', 'Instinctive'],
    antonyms: ['Planned', 'Calculated', 'Deliberate']
  },
  {
    id: 'v-104',
    word: 'Superfluous',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Exceeding what is sufficient or necessary; unnecessary',
    marathiMeaning: 'गरजेपेक्षा जास्त / अनावश्यक / फाजील',
    pronunciation: '/suːˈpɜː.flu.əs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Avoid using superfluous words in technical documentation.',
        marathi: 'तांत्रिक लिखाणात गरजेपेक्षा जास्त आणि अनावश्यक शब्द वापरणे टाळा.'
      },
      {
        english: 'His extra purchases felt superfluous when reviewing his monthly budget.',
        marathi: 'महिन्याच्या बजेटचा आढावा घेताना त्याची अतिरिक्त खरेदी पूर्णपणे अनावश्यक वाटली.'
      }
    ],
    synonyms: ['Redundant', 'Excessive', 'Surplus', 'Unneeded'],
    antonyms: ['Necessary', 'Essential', 'Required']
  },
  {
    id: 'v-105',
    word: 'Tenacious',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Tending to keep a firm hold of something; clinging or adhering closely; persistent',
    marathiMeaning: 'चिवट / जिद्दी / हट्टी चिकाटी असणारा',
    pronunciation: '/təˈneɪ.ʃəs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Her tenacious effort helped solve the long-standing distributed systems bug.',
        marathi: 'तिच्या जिद्दी प्रयत्नांमुळे प्रणालीतील दीर्घकाळ प्रलंबित दोष सोडवण्यात मदत झाली.'
      },
      {
        english: 'A tenacious student never gives up despite facing tough exam problems.',
        marathi: 'एक जिद्दी विद्यार्थी कठीण प्रश्नांसमोर कधीही हार मानत नाही.'
      }
    ],
    synonyms: ['Persistent', 'Resolute', 'Dogged', 'Stubborn'],
    antonyms: ['Weak', 'Yielding', 'Fickle']
  },
  {
    id: 'v-106',
    word: 'Ubiquitous',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Present, appearing, or found everywhere simultaneously',
    marathiMeaning: 'सर्वव्यापी / सर्वत्र आढळणारा',
    pronunciation: '/juːˈbɪk.wɪ.təs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Smartphones have become ubiquitous across Indian towns and villages.',
        marathi: 'स्मार्टफोन्स हे भारतातील गावागावांत आणि शहरात सर्वव्यापी झाले आहेत.'
      },
      {
        english: 'UPI payments are now ubiquitous in everyday commerce.',
        marathi: 'दैनंदिन व्यवहारांमध्ये यूपीआय पेमेंट्स आता सर्वत्र उपलब्ध आणि सर्वव्यापी झाले आहेत.'
      }
    ],
    synonyms: ['Omnipresent', 'Everywhere', 'Universal', 'Pervasive'],
    antonyms: ['Rare', 'Scarce', 'Seldom']
  },
  {
    id: 'v-107',
    word: 'Validate',
    partOfSpeech: 'verb',
    simpleMeaning: 'To check or prove the validity or accuracy of something',
    marathiMeaning: 'पडताळणी करणे / वैध ठरवणे',
    pronunciation: '/ˈvæl.ɪ.deɪt/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'Always validate monetary input to eliminate floating-point calculation errors.',
        marathi: 'आर्थिक हिशेबातील चुका टाळण्यासाठी इनपुट रकमेची नेहमी पडताळणी करा.'
      },
      {
        english: 'Scientific experiments must be replicated to validate their conclusions.',
        marathi: 'निष्कर्षांची अचूकता पडताळण्यासाठी शास्त्रीय प्रयोगांची पुनरावृत्ती झाली पाहिजे.'
      }
    ],
    synonyms: ['Confirm', 'Verify', 'Authenticate', 'Corroborate'],
    antonyms: ['Invalidate', 'Reject', 'Disprove']
  },
  {
    id: 'v-108',
    word: 'Versatile',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Able to adapt or be adapted to many different functions or activities',
    marathiMeaning: 'ष्टपैलू / बहुगुणी',
    pronunciation: '/ˈvɜː.sə.taɪl/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'TypeScript is a versatile language for both frontend and backend development.',
        marathi: 'टाइपस्क्रिप्ट ही फ्रंटएंड आणि बॅकएंड या दोन्हीसाठी अत्यंत बहुगुणी भाषा आहे.'
      },
      {
        english: 'She is a versatile engineer who easily switches between UI design and database logic.',
        marathi: 'ती एक अष्टपैलू अभियंता आहे जी डिझाइन आणि डेटाबेस लॉजिक या दोन्हींमध्ये सहज वावरते.'
      }
    ],
    synonyms: ['Adaptable', 'Multifaceted', 'Flexible', 'All-around'],
    antonyms: ['Inflexible', 'Limited', 'Rigid']
  },
  {
    id: 'v-109',
    word: 'Zealous',
    partOfSpeech: 'adjective',
    simpleMeaning: 'Having or showing great energy or enthusiasm in pursuit of a cause or objective',
    marathiMeaning: 'अत्यंत उत्साही / ध्यास घेतलेला / आवेशी',
    pronunciation: '/ˈzel.əs/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'He was a zealous advocate for digital privacy and offline user rights.',
        marathi: 'डिजिटल गोपनीयता आणि वापरकर्त्यांच्या ऑफलाइन हक्कांचे ते अत्यंत उत्साही पुरस्कर्ते होते.'
      },
      {
        english: 'The team worked with zealous dedication to launch on schedule.',
        marathi: 'वेळेवर ॲप प्रसिद्ध करण्यासाठी टीमने मोठ्या उत्साहाने आणि समर्पणाने काम केले.'
      }
    ],
    synonyms: ['Passionate', 'Fervent', 'Ardent', 'Enthusiastic'],
    antonyms: ['Apathetic', 'Indifferent', 'Lethargic']
  },
  {
    id: 'v-110',
    word: 'Equanimity',
    partOfSpeech: 'noun',
    simpleMeaning: 'Mental calmness, composure, and evenness of temper in difficult situations',
    marathiMeaning: 'मनःशांती / समचित्तता / स्थितप्रज्ञता',
    pronunciation: '/ˌek.wəˈnɪm.ə.ti/',
    difficulty: 'advanced',
    examples: [
      {
        english: 'He accepted both victory and defeat with admirable equanimity.',
        marathi: 'त्याने जय आणि पराजय दोन्ही गोष्टींचे शांत चित्ताने स्वागत केले.'
      },
      {
        english: 'Meditation cultivates equanimity during times of emotional turmoil.',
        marathi: 'ध्यानामुळे भावनिक अशांततेच्या काळात समचित्तता आणि मनःशांती टिकून राहते.'
      }
    ],
    synonyms: ['Composure', 'Serenity', 'Self-possession', 'Calmness'],
    antonyms: ['Agitation', 'Anxiety', 'Excitement']
  }
];

export const VOCABULARY_DATASET: VocabWord[] = RAW_DATASET.map((w) => ({
  ...w,
  meaning: w.simpleMeaning,
  examples: w.examples.map((ex) => ({
    english: ex.english,
    marathi: ex.marathi,
    sentence: ex.english,
    marathiTranslation: ex.marathi,
  })),
}));

export const VOCAB_MAP: Record<string, VocabWord> = VOCABULARY_DATASET.reduce((acc, word) => {
  acc[word.id] = word;
  return acc;
}, {} as Record<string, VocabWord>);


export const pageGuides = {
  // Çiftçi Ortak & Ana Sayfalar
  '/': {
    title: 'Ana Çiftlik Özeti',
    description: 'Burası işletmenizin kalbidir. Çiftliğinizin en hayati verilerini ve yaklaşan görevleri tek bir bakışta görebilirsiniz.',
    sections: [
      {
        subtitle: 'Genel İstatistikler',
        text: 'Toplam o anki inek, buzağı ve düve sayınızı, bir önceki aya göre süt üretimi değişiminizi gösterir.',
        icon: 'FiPieChart'
      },
      {
        subtitle: 'Yapılacaklar & Bildirimler',
        text: 'Doğumu yaklaşan inekler, kuruya ayrılacaklar ve sütten kesilecek buzağılar için sistem algoritmasının ürettiği akıllı görevleri listeler.',
        icon: 'FiCheckCircle'
      },
      {
        subtitle: 'Kısa Yollar',
        text: 'Hızlıca hayvan ekleme, yem düşümü yapma veya toplu süt girme tuşları en üstte elinizin altındadır.',
        icon: 'FiActivity'
      }
    ]
  },
  '/inekler': {
    title: 'Süt İnekleri',
    description: 'Çiftliğinizdeki sağmal inekleri, gebelik durumlarını ve bireysel süt üretimlerini yönetebileceğiniz ana platform.',
    sections: [
      {
        subtitle: 'Yeni İnek Ekleme',
        text: 'Sağ üstteki butondan detaylı kimlik, yaş ve ırk verileriyle yeni hayvan profilinizi oluşturabilirsiniz.',
        icon: 'FiPlus'
      },
      {
        subtitle: 'Gebelik & Kızgınlık',
        text: 'Tohumlama tarihi girilen hayvanlarda yaklaşan doğum ve kızgınlık tarihleri otomatik hesaplanarak listelenir.',
        icon: 'FiActivity'
      }
    ]
  },
  '/buzagilar': {
    title: 'Buzağı Kreşi (0-6 Ay)',
    description: 'Yeni doğan buzağıların gelişimini, sütten kesilme tarihlerini ve aşı planlamalarını takip edeceğiniz ekran.',
    sections: [
      {
        subtitle: 'Sütten Kesim Alarmı',
        text: 'Buzağılar 90. gününe (3. Ayına) bastığı an sistem kırmızı alarm vererek sütten kesim operasyonunu hatırlatır.',
        icon: 'FiCheckCircle'
      },
      {
        subtitle: 'Durum Kontrolü',
        text: 'Buzağılarınızın cinsiyetine ve güncel sağlık verisine göre gelişim tablolarını takip edersiniz.',
        icon: 'FiActivity'
      }
    ]
  },
  '/duveler': {
    title: 'Düveler (Genç Dişiler)',
    description: 'Sıfır ile ilk doğumunu yapana kadar olan dişi hayvanların (Düvelerin) toplandığı yetiştirme listesidir.',
    sections: [
      {
        subtitle: 'İlk Tohumlama',
        text: 'Düveleriniz belirli bir aylık yaşa ulaştığında tohumlama yapılabileceği sistem tarafından size önerilir.',
        icon: 'FiActivity'
      }
    ]
  },
  '/tosunlar': {
    title: 'Tosunlar (Erkekler)',
    description: 'Boya veya besi amacıyla büyütülen erkek hayvanların (Tosun/Dana) kaydedildiği paneldir.',
    sections: [
      {
        subtitle: 'Besi Takibi',
        text: 'Hayvanların tahmini ağırlık artışlarına ve satış vakitlerine göre gruplandırmalar yapabilirsiniz.',
        icon: 'FiTrendingUp'
      }
    ]
  },
  '/toplu-sut': {
    title: 'Toplu Süt Veri Girişi',
    description: 'Sabah, Akşam veya ortak sağım verilerini tüm sürünüz için en pratik şekilde dijital ortama aktarın.',
    sections: [
      {
        subtitle: 'Akıllı Dağılım',
        text: 'Sıfırdan tek tek litre girmek yerine, sistemin ineklerin son 7 günlük verim profiline göre oranlama yaparak toplam hacmi otomatik dağıtmasını sağlar.',
        icon: 'FiDroplet'
      },
      {
        subtitle: 'Manuel Kontrol',
        text: 'Akıllı veya Eşit dağıtımdan sonra ineklerinizin özel sağlık veya verim durumuna göre üzerlerinde ufak düzeltmeler (Manuel düzenleme) yapabilirsiniz.',
        icon: 'FiList'
      }
    ]
  },
  '/saglik-merkezi': {
    title: 'Sağlık & Veteriner Yönetimi',
    description: 'Hastalanan hayvanlarınızın tedavi takibi, revir kayıtları ve veteriner reçetelerini tuttuğunuz kliniktir.',
    sections: [
      {
        subtitle: 'Aktif Tedaviler',
        text: 'Revirde yatan hayvanlar ve devam eden ilaç uygulamalarını bu ekrandan kontrol eder, tedavi süreçlerini takip edersiniz.',
        icon: 'FiActivity'
      },
      {
        subtitle: 'Otomatik İlaç Düşümü',
        text: 'Reçetede ilacın günlük dozu belirtilmişse, sistem her gece 06:00\'da stoklarınızdan o ilacın dozajını otomatik azaltır.',
        icon: 'FiBox'
      }
    ]
  },
  '/takvim': {
    title: 'Çiftlik Takvimi',
    description: 'Her şeyi zaman çizelgesinde görebilmeniz için hazırlanan detaylı takvim ve planlama modülü.',
    sections: [
      {
        subtitle: 'Görev Atama & Planlama',
        text: 'Aşı güncellemeleri, veteriner etkinlikleri veya kişisel operasyon notlarınızı takvime ekleyebilirsiniz.',
        icon: 'FiCalendar'
      },
      {
        subtitle: 'Süt Geçmişi Taraması',
        text: 'Geçmiş aylardaki verileri ve kaydedilmiş toplu kitle girişleri hızlıca görebilmek için takvimdeki geçmiş günlere tıklamanız yeterlidir.',
        icon: 'FiDroplet'
      }
    ]
  },
  '/yem-merkezi': {
    title: 'Kapsamlı Yem Merkezi',
    description: 'Tedarik zinciriniz ile çiftlik deposu arasındaki stok akışını ve maliyetleri takip edebileceğiniz ambar sayfasıdır.',
    sections: [
      {
        subtitle: 'Canlı Stok Takibi',
        text: 'Kaba veya Kesif yem alımları yapıp depoya eklenmesini sağlarsınız. Gerçek zamanlı ambar seviyesi görülür.',
        icon: 'FiBox'
      },
      {
        subtitle: 'Otomatik Rasyon Düşümü',
        text: 'Gruplar kısmından hayvanlara bağlanan rasyonlar yendikçe sistem arka planda günlük depo erimesini kendisi hesaplar.',
        icon: 'FiTrendingUp'
      }
    ]
  },
  '/finansal': {
    title: 'Finansal Gelir-Gider',
    description: 'Çiftliğinizin tüm muhasebesel harcama, süt geliri ve personel maaşları yönetimini yapabilirsiniz.',
    sections: [
      {
        subtitle: 'Süt Gelirleri',
        text: 'Sütçünüz (Toplayıcı) "Ödeme Yap" dediğinde sistem bu sayfaya aylık süt getirinizi net gelir olarak anında yansıtır.',
        icon: 'FiBriefcase'
      },
      {
        subtitle: 'Gider Raporlaması',
        text: 'Alınan yemler, ilaç masrafları ve ekstra faturasal tüm borçlarınızı kategorize ederek ekleyebilirsiniz.',
        icon: 'FiTrendingUp'
      }
    ]
  },
  '/karlilik': {
    title: 'İleri Seviye Karlılık Analizi',
    description: 'İşletmenizin net kara geçip geçmediğini litre/süt hesaplamaları ve ambar giderleri oranlarıyla yapay zeka tarzı hesaplayan rapor.',
    sections: [
      {
        subtitle: 'Veri Korelasyonu',
        text: 'Yem fiyatları ile sütün litre satışından gelen ham parayı kıyaslayıp hayvan başı net dönüşümü sunar.',
        icon: 'FiPieChart'
      }
    ]
  },
  '/ayarlar': {
    title: 'Profil ve Sistem Ayarları',
    description: 'Rolünüze göre Çiftlik veya Şirket bilgilerinizi güncelleyip hesap şifre değişim işlemlerini yaptığınız menüdür.',
    sections: [
      {
        subtitle: 'Sistem Tercihleri',
        text: 'Buradan kişisel bilgilerinizi ve giriş hesap yönetim ayarlarınızı gerçekleştirebilirsiniz.',
        icon: 'FiUsers'
      }
    ]
  },
  '/bildirimler': {
    title: 'Bildirim Merkezi',
    description: 'Gözden kaçırdığınız otomatik sistem uyarıları, veteriner uyarısı ve yaklaşan görev bildirim arşivinin tamamıdır.',
    sections: [
      {
        subtitle: 'Aksiyon Al',
        text: 'Süresi geçmiş işlemleri okundu olarak işaretleyebilir veya direkt üzerine tıklayarak ilgili varlık veya hedefe sayfada atlayabilirsiniz.',
        icon: 'FiList'
      }
    ]
  },

  // SÜT TOPLAYICI ÖZEL
  '/ciftlikler': {
    title: 'Ağdaki Çiftliklerim',
    description: 'Bir süt toplayıcısı olarak sizinle çalışan, sütlerini sizden sisteme işleten tüm çiftlik kodlarıyla kayıtlı üyeleriniz.',
    sections: [
      {
        subtitle: 'Çiftlik Ekleme',
        text: 'Çiftçinin size verdiği özel kimlik koduyla o çiftliği ağınıza (Portföyünüze) katabilirsiniz.',
        icon: 'FiPlus'
      }
    ]
  },
  '/sut-girisi': {
    title: 'Hızlı Süt Toplama Ekranı',
    description: 'Çiftçilerden o an tankerle aldığınız (Sabah/Akşam) süt verisini sisteme işlediğiniz ana şoför formunuz.',
    sections: [
      {
        subtitle: 'Dağılım Özelliği',
        text: 'Buradan girdiğiniz X Litre süt, anında otomatik olarak çiftçinin hesabında da "Toplayıcı Verisi" uyarı formunda çıkacaktır.',
        icon: 'FiDroplet'
      }
    ]
  },
  '/gelir': {
    title: 'Bekleyen Ödemeler ve Tahsilat',
    description: 'Aylar geçtikçe çiftçilerden topladığınız devasa sütlerin onlara ödenmesi gereken Türk Lirası miktarını toptan gördüğünüz alan.',
    sections: [
      {
        subtitle: 'Otomatik Hesap',
        text: 'Kimin size ne kadar litrelik süt teslim ettiğini görür ve "Ödeme Yap" tuşu ile sistemi sıfırlayıp çiftçiye paranın ödendiğini beyan edersiniz.',
        icon: 'FiBriefcase'
      }
    ]
  },

  // VETERİNER ÖZEL
  '/hastalar': {
    title: 'Aktif Hasta Dosyaları',
    description: 'Uye çiftçilerinizde bulunan hayvanlardan teşhis edilen, randevu alınan ve tedbir oluşturulan hasta evraklarının merkezi.',
    sections: [
      {
        subtitle: 'Reçete & İlaç',
        text: 'Muayene sonucu yazılan her teşhis ve tedavi protokolü anında uzaktaki çiftçinin bildirim paneline uyarı olarak yansır.',
        icon: 'FiActivity'
      }
    ]
  },
  '/receteler': {
    title: 'Veteriner İlaç Deposu',
    description: 'Polikliniğinizin şahsi ilaç kutularını takip edip sayımlarını girdiğiniz envanter alanı.',
    sections: [
      {
        subtitle: 'Erişim ve Satış',
        text: 'Satılan her ilaç bu kütüphaneden düşerek gelir panelinizde bir fiş değeri olarak karşılık bulur.',
        icon: 'FiBox'
      }
    ]
  },
  '/finans': {
    title: 'Veteriner Kliniği Finans',
    description: 'Gidilen yol bedelleri, satılan ilaçlar ve aylık danışmanlık ödeneklerinizin net ve brüt rapor tablosu.',
    sections: [
      {
        subtitle: 'Kazanç',
        text: 'Kliniğinizin ciro takibini bu kısımdan 30 günlük, dönemsel ve grafiksel periyotlarda süzebilirsiniz.',
        icon: 'FiTrendingUp'
      }
    ]
  }
};

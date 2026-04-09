import { FiPieChart, FiActivity, FiDroplet, FiBriefcase, FiCalendar, FiUsers, FiBox, FiList, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { FaCow } from 'react-icons/fa';

export const pageGuides = {
  '/dashboard': {
    title: 'Çiftlik Özeti (Dashboard)',
    description: 'Burası işletmenizin kalbidir. Çiftliğinizin en hayati verilerini ve yaklaşan görevleri tek bir bakışta görebilirsiniz.',
    sections: [
      {
        subtitle: 'Genel İstatistikler',
        text: 'Toplam o anki inek, buzağı ve düve sayınızı, bir önceki aya göre süt üretimi değişiminizi gösterir.',
        icon: 'FiPieChart'
      },
      {
        subtitle: 'Yapılacaklar & Otomatik Bildirimler',
        text: 'Doğumu yaklaşan inekler, kuruya ayrılacaklar ve sütten kesilecek buzağılar için sistem algoritmasının ürettiği akıllı görevleri listeler.',
        icon: 'FiCheckCircle'
      },
      {
        subtitle: 'Stok ve Finans',
        text: 'Kritik seviyeye düşmüş yemlerinizi ve son 30 gün içerisindeki net maliyet tablonuzu finansal olarak analiz eder.',
        icon: 'FiTrendingUp'
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
        subtitle: 'Gebelik & Kızgınlık Tespiti',
        text: 'Tohumlama tarihi girilen hayvanlarda yaklaşan doğum ve kızgınlık tarihleri otomatik hesaplanarak listelenir.',
        icon: 'FiActivity'
      },
      {
        subtitle: 'Detaylı İnceleme',
        text: 'Hayvanın kartına tıklayarak onun detay sayfasına gidebilir, hastalık geçmişi ve yediği rasyonları görebilirsiniz.',
        icon: 'FaCow'
      }
    ]
  },
  '/toplu-sut': {
    title: 'Süt Veri Girişi',
    description: 'Sabah, Akşam veya ortak sağım verilerini tüm sürünüz için en pratik şekilde dijital ortama aktarın.',
    sections: [
      {
        subtitle: 'Akıllı Dağılım',
        text: 'Sıfırdan tek tek litre girmek yerine, sistemin ineklerin son 7 günlük verim profiline göre oranlama yaparak toplam hacmi otomatik dağıtmasını sağlar.',
        icon: 'FiDroplet'
      },
      {
        subtitle: 'Manuel Kontrol',
        text: 'Akıllı dağıtım veya eşit dağıtımdan sonra, ineklerinizin özel sağlık veya verim durumuna göre üzerlerinde ufak düzeltmeler (Manuel düzenleme) yapabilirsiniz.',
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
        text: 'Revirde yatan hayvanlar ve devam eden ilaç uygulamalarını bu ekrandan kontrol eder, ilaç bitiş süreçlerini takip edersiniz.',
        icon: 'FiActivity'
      },
      {
        subtitle: 'Günlük Otomatik Düşüm',
        text: 'Eğer bir reçetede ilacın günlük dozu belirtilmişse, sistem her gece 06:00\'da stoklarınızdan o ilacın dozajını otomatik azaltır.',
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
        text: 'Aşı güncellemeleri, veteriner periyotları veya kişisel notlarınızı takvime ekleyebilirsiniz.',
        icon: 'FiCalendar'
      },
      {
        subtitle: 'Süt Verisi Taraması',
        text: 'Geçmiş aylardaki verileri ve kaydedilmiş toplu kitle girişleri hızlıca görebilmek için geçmiş tarihteki günlerin üstüne tıklamanız yeterlidir.',
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
        text: 'Kaba veya Kesif yem alımları yapıp kilonun depoya eklenmesini sağlarsınız. Gerçek zamanlı ambar seviyesi görülür.',
        icon: 'FiBox'
      },
      {
        subtitle: 'Otomatik Rasyon Düşümü',
        text: 'Eğer "Gruplar" kısmından gruba rasyon atarsanız, öğünleme esnasında bu yemi hayvanlar yedikçe stoktan erimeye başlar.',
        icon: 'FiTrendingUp'
      }
    ]
  }
};

const { Category, Product, Blog, Banner } = require('../models');

const slugify = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const categories = [
  { id: 1, name: 'Hoa tình yêu', slug: 'hoa-tinh-yeu', order: 1, icon: '❤️' },
  { id: 2, name: 'Hoa sinh nhật', slug: 'hoa-sinh-nhat', order: 2, icon: '🎂' },
  { id: 3, name: 'Hoa khai trương', slug: 'hoa-khai-truong', order: 3, icon: '🏬' },
  { id: 4, name: 'Hoa chúc mừng', slug: 'hoa-chuc-mung', order: 4, icon: '🎉' },
  { id: 5, name: 'Hoa cưới', slug: 'hoa-cuoi', order: 5, icon: '💐' }
];

const products = [
  {
    id: 1,
    name: 'Bó hoa hồng Pastel',
    slug: 'bo-hoa-hong-pastel',
    categoryId: 1,
    price: 350000,
    oldPrice: 450000,
    hot: true,
    stock: 15,
    sold: 142,
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=500&auto=format&fit=crop',
    description: 'Bó hoa hồng pastel nhập khẩu nhẹ nhàng tinh tế, tặng kèm thiệp viết tay ý nghĩa.'
  },
  {
    id: 2,
    name: 'Bó hoa Đồng Nội',
    slug: 'bo-hoa-dong-noi',
    categoryId: 2,
    price: 290000,
    oldPrice: 350000,
    hot: false,
    stock: 20,
    sold: 98,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&auto=format&fit=crop',
    description: 'Sự kết hợp mộc mạc và tươi tắn từ các loài hoa dại rực rỡ, thích hợp tặng sinh nhật bạn bè.'
  },
  {
    id: 3,
    name: 'Hoa Tình Yêu Ngọt Ngào',
    slug: 'hoa-tinh-yeu-ngot-ngao',
    categoryId: 1,
    price: 420000,
    oldPrice: 500000,
    hot: true,
    stock: 12,
    sold: 210,
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=500&auto=format&fit=crop',
    description: 'Sắc hoa nồng thắm đại diện cho tình yêu bền lâu, gói giấy lụa cao cấp.'
  },
  {
    id: 4,
    name: 'Giỏ Hoa Thanh Xuân',
    slug: 'gio-hoa-thanh-xuan',
    categoryId: 4,
    price: 390000,
    oldPrice: 450000,
    hot: false,
    stock: 8,
    sold: 85,
    image: 'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=500&auto=format&fit=crop',
    description: 'Giỏ hoa tone vàng cam thanh xuân, rạng ngời năng lượng tích cực mừng ngày tốt nghiệp, thăng tiến.'
  },
  {
    id: 5,
    name: 'Bó Hồng Đỏ Nồng Nàn',
    slug: 'bo-hong-do-nong-nan',
    categoryId: 1,
    price: 320000,
    oldPrice: 400000,
    hot: true,
    stock: 25,
    sold: 320,
    image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=500&auto=format&fit=crop',
    description: '99 đóa hoa hồng đỏ Ecuador biểu tượng cho tình yêu vĩnh cửu.'
  },
  {
    id: 6,
    name: 'Hoa Sắc Màu Rực Rỡ',
    slug: 'hoa-sac-mau-ruc-ro',
    categoryId: 3,
    price: 300000,
    oldPrice: 400000,
    hot: false,
    stock: 18,
    sold: 115,
    image: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=500&auto=format&fit=crop',
    description: 'Kệ hoa đa sắc mừng khai trương hồng phát, tài lộc dồi dào.'
  },
  {
    id: 7,
    name: 'Bó Hoa Dịu Dàng',
    slug: 'bo-hoa-diu-dang',
    categoryId: 5,
    price: 255000,
    oldPrice: 300000,
    hot: false,
    stock: 0,
    sold: 90,
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=500&auto=format&fit=crop',
    description: 'Hoa cưới cầm tay cô dâu trang nhã, điểm xuyết hoa baby trắng tinh khôi.'
  },
  {
    id: 8,
    name: 'Giỏ Hoa Ngọt Ngào',
    slug: 'gio-hoa-ngot-ngao',
    categoryId: 2,
    price: 350000,
    oldPrice: 500000,
    hot: true,
    stock: 10,
    sold: 175,
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&auto=format&fit=crop',
    description: 'Giỏ hoa tone pastel ngọt ngào dịu mát làm say đắm mọi ánh nhìn.'
  },
  {
    id: 9,
    name: 'Lẵng Hoa Khai Trương Phát Tài',
    slug: 'lang-hoa-khai-truong-phat-tai',
    categoryId: 3,
    price: 680000,
    oldPrice: 850000,
    hot: true,
    stock: 7,
    sold: 60,
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&auto=format&fit=crop',
    description: 'Lẵng hoa chúc mừng khai trương sang trọng với hoa hướng dương và hoa hồng môn.'
  },
  {
    id: 10,
    name: 'Hoa Cưới Cầm Tay Thuần Khiết',
    slug: 'hoa-cuoi-cam-tay-thuan-khiet',
    categoryId: 5,
    price: 490000,
    oldPrice: 600000,
    hot: false,
    stock: 6,
    sold: 45,
    image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=500&auto=format&fit=crop',
    description: 'Hoa cầm tay cô dâu từ hoa rum và tulip trắng cao quý.'
  },
  {
    id: 11,
    name: 'Bó Tulip Vàng May Mắn',
    slug: 'bo-tulip-vang-may-man',
    categoryId: 4,
    price: 520000,
    oldPrice: 650000,
    hot: true,
    stock: 9,
    sold: 130,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&auto=format&fit=crop',
    description: 'Bó hoa tulip vàng Hà Lan mang thông điệp rạng rỡ và thành công.'
  },
  {
    id: 12,
    name: 'Hộp Hoa Hồng Sang Trọng',
    slug: 'hop-hoa-hong-sang-trong',
    categoryId: 1,
    price: 450000,
    oldPrice: 550000,
    hot: false,
    stock: 14,
    sold: 88,
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=500&auto=format&fit=crop',
    description: 'Hộp hoa tròn nắp mica trong suốt hiện đại và quý phái.'
  }
];

const blogs = [
  {
    id: 1,
    title: 'Bí quyết giữ hoa tươi lâu hơn 1 tuần',
    slug: 'bi-quyet-giu-hoa-tuoi-lau',
    summary: 'Mẹo cắt gốc hoa, pha nước dưỡng hoa giúp bình hoa luôn thơm ngát.',
    content: 'Cắt cành chéo 45 độ, thay nước mỗi ngày và thêm một chút đường hoặc nước cốt chanh vào bình cắm.',
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Ý nghĩa các loài hoa trong tình yêu',
    slug: 'y-nghia-cac-loai-hoa-tinh-yeu',
    summary: 'Hoa hồng, hoa tulip, cẩm chướng nói lên điều gì về cảm xúc của bạn?',
    content: 'Mỗi màu sắc hoa hồng mang một thông điệp riêng: Đỏ nồng nàn, hồng dịu dàng, trắng thuần khiết.',
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Gợi ý chọn hoa mừng khai trương phát tài',
    slug: 'goi-y-chon-hoa-khai-truong',
    summary: 'Những sắc hoa rực rỡ mang đến may mắn, tài lộc cho gia chủ.',
    content: 'Kệ hoa khai trương nên chọn tone đỏ, vàng, cam để mang lại sinh khí và thịnh vượng.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop'
  }
];

const banners = [
  {
    id: 1,
    title: 'Một bó hoa, ngàn lời yêu',
    slug: 'mot-bo-hoa-ngan-loi-yeu',
    subtitle: 'Miễn phí thiệp chúc mừng cao cấp',
    link: '/khuyen-mai',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Hoa tươi trao tận tay',
    slug: 'hoa-tuoi-trao-tan-tay',
    subtitle: 'Giao nhanh trong 60 phút nội thành',
    link: '/category/hoa-tinh-yeu',
    image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=900&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Ưu đãi đặt hoa sớm',
    slug: 'uu-dai-dat-hoa-som',
    subtitle: 'Giảm 15% cho đơn đặt trước 3 ngày',
    link: '/khuyen-mai',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&auto=format&fit=crop'
  }
];

async function seed() {
  const tasks = [[Category, categories], [Product, products], [Blog, blogs], [Banner, banners]];
  // Nếu database đang chứa dữ liệu mẫu cũ (giày dép) hoặc ảnh lỗi thì tự động cập nhật lại
  const hasOldTemplate = await Product.exists({ slug: 'giay-the-thao' });
  const hasBrokenImg = await Product.exists({ image: /1494336934272-f0efcedfc8a9|1518709268805-4e9042af9f23/ });
  if (hasOldTemplate || hasBrokenImg) {
    for (const [Model] of tasks) {
      await Model.deleteMany({});
    }
  }

  for (const [Model, data] of tasks) {
    if ((await Model.countDocuments()) === 0) {
      await Model.insertMany(data);
      console.log(`Seeded ${Model.modelName}: ${data.length}`);
    }
  }
}

module.exports = { seed, slugify };

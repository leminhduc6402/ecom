type Variant = {
  value: string;
  options: string[];
};

type SKU = {
  value: string;
  price: number;
  stock: number;
  image: string;
};

type Data = {
  product: {
    publishedAt: string | null;
    name: string;
    basePrice: number;
    virtualPrice: number;
    brandId: number;
    images: string[];
    variants: Variant[];
    categories: number[];
  };
  skus: SKU[];
};

const data: Data = {
  product: {
    publishedAt: new Date().toISOString(),
    name: 'Sản phẩm mẫu',
    basePrice: 100000,
    virtualPrice: 100000,
    brandId: 1,
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg', 'https://example.com/image3.jpg'],
    categories: [1, 2, 3],
    variants: [
      {
        value: 'Màu sắc',
        options: ['Đen', 'Trắng', 'Xanh', 'Đỏ'],
      },
      {
        value: 'Kích thước',
        options: ['S', 'M', 'L', 'XL'],
      },
      {
        value: 'Chất liệu',
        options: ['Cotton', 'Polyester', 'Linen'],
      },
    ],
  },
  skus: [
    { value: 'S-Đen', price: 0, stock: 100, image: '' },
    { value: 'S-Trắng', price: 0, stock: 100, image: '' },
    { value: 'S-Xanh', price: 0, stock: 100, image: '' },
    { value: 'S-Tím', price: 0, stock: 100, image: '' },
    { value: 'M-Đen', price: 0, stock: 100, image: '' },
    { value: 'M-Trắng', price: 0, stock: 100, image: '' },
    { value: 'M-Xanh', price: 0, stock: 100, image: '' },
    { value: 'M-Tím', price: 0, stock: 100, image: '' },
    { value: 'L-Đen', price: 0, stock: 100, image: '' },
    { value: 'L-Trắng', price: 0, stock: 100, image: '' },
    { value: 'L-Xanh', price: 0, stock: 100, image: '' },
    { value: 'L-Tím', price: 0, stock: 100, image: '' },
    { value: 'XL-Đen', price: 0, stock: 100, image: '' },
    { value: 'XL-Trắng', price: 0, stock: 100, image: '' },
    { value: 'XL-Xanh', price: 0, stock: 100, image: '' },
    { value: 'XL-Tím', price: 0, stock: 100, image: '' },
  ],
};
console.log(data);
function generateSKUs(variants: Variant[]): SKU[] {
  if (variants.length === 0) return [];

  // Lấy danh sách options của từng variant
  const optionGroups = variants.map((v) => v.options);

  // Hàm tạo tổ hợp (cartesian product)
  const combinations = optionGroups.reduce<string[][]>(
    (acc, options) => {
      const result: string[][] = [];

      for (const prev of acc) {
        for (const option of options) {
          result.push([...prev, option]);
        }
      }

      return result;
    },
    [[]],
  );

  // Convert sang SKU[]
  return combinations.map((combo) => ({
    value: combo.join('-'),
    price: 0,
    stock: 100,
    image: '',
  }));
}
const variants: Variant[] = [
  {
    value: 'Kích thước',
    options: ['S', 'M', 'L', 'XL'],
  },
  {
    value: 'Màu sắc',
    options: ['Đen', 'Trắng', 'Xanh', 'Tím'],
  },
];

const skus = generateSKUs(variants);

console.log(skus);

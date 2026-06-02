import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, BookOpen, Bookmark, Share2, ChevronRight, Check, Shield, Award, AlertCircle, Clock, User, FileText, ArrowLeft, Star, Calendar, Building2, ExternalLink, ThumbsUp, MessageCircle, X } from 'lucide-react';

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
`;

// ============ MOCK DATA ============
const FIELDS = [
  { id: 'all', name: 'Tất cả', count: 2847 },
  { id: 'cntt', name: 'Công nghệ thông tin', count: 512 },
  { id: 'kt', name: 'Kinh tế', count: 428 },
  { id: 'yk', name: 'Y khoa', count: 317 },
  { id: 'lu', name: 'Luật', count: 289 },
  { id: 'kt-xd', name: 'Kỹ thuật & Xây dựng', count: 356 },
  { id: 'nn', name: 'Ngôn ngữ', count: 241 },
  { id: 'sp', name: 'Sư phạm', count: 198 },
  { id: 'tn', name: 'Khoa học tự nhiên', count: 276 },
  { id: 'xh', name: 'Khoa học xã hội', count: 230 },
];

const SUBJECTS = {
  cntt: ['Giải thuật', 'Cấu trúc dữ liệu', 'Học máy', 'Mạng máy tính', 'Cơ sở dữ liệu', 'Trí tuệ nhân tạo'],
  kt: ['Kinh tế vi mô', 'Kinh tế vĩ mô', 'Tài chính doanh nghiệp', 'Marketing', 'Kế toán'],
  yk: ['Giải phẫu', 'Sinh lý học', 'Dược lý', 'Nội khoa', 'Ngoại khoa'],
  lu: ['Luật Hiến pháp', 'Luật Dân sự', 'Luật Hình sự', 'Luật Thương mại'],
  'kt-xd': ['Sức bền vật liệu', 'Cơ học kết cấu', 'Kỹ thuật điện', 'Vật liệu xây dựng'],
  nn: ['Ngữ pháp tiếng Anh', 'Dịch thuật', 'Ngôn ngữ học'],
  sp: ['Tâm lý giáo dục', 'Phương pháp giảng dạy'],
  tn: ['Vật lý đại cương', 'Hóa học', 'Toán cao cấp', 'Xác suất thống kê'],
  xh: ['Xã hội học', 'Triết học', 'Lịch sử'],
};

const DOCUMENTS = [
  {
    id: 1,
    title: 'Giáo trình Giải thuật và Cấu trúc dữ liệu',
    author: 'PGS. TS. Nguyễn Văn An',
    field: 'cntt',
    fieldName: 'Công nghệ thông tin',
    subject: 'Giải thuật',
    type: 'Giáo trình',
    year: 2024,
    pages: 412,
    verification: 'gold',
    rating: 4.8,
    reviews: 1247,
    downloads: 8934,
    views: 24531,
    institution: 'ĐH Bách Khoa Hà Nội',
    description: 'Giáo trình chính thức được Hội đồng Khoa học ĐH Bách Khoa thẩm định, bao gồm đầy đủ các thuật toán cơ bản và nâng cao, cùng hệ thống bài tập phong phú.',
    size: '18.4 MB',
    format: 'PDF',
    tags: ['Thuật toán', 'Cấu trúc dữ liệu', 'Lập trình'],
  },
  {
    id: 2,
    title: 'Nguyên lý Kinh tế học Vĩ mô',
    author: 'TS. Trần Minh Hoàng',
    field: 'kt',
    fieldName: 'Kinh tế',
    subject: 'Kinh tế vĩ mô',
    type: 'Giáo trình',
    year: 2023,
    pages: 356,
    verification: 'gold',
    rating: 4.7,
    reviews: 892,
    downloads: 6421,
    views: 18239,
    institution: 'ĐH Kinh tế Quốc dân',
    description: 'Tài liệu chuẩn được Bộ Giáo dục công nhận cho chương trình đào tạo cử nhân kinh tế.',
    size: '12.1 MB',
    format: 'PDF',
    tags: ['Kinh tế vĩ mô', 'Chính sách tiền tệ'],
  },
  {
    id: 3,
    title: 'Tổng hợp bài tập Học máy cơ bản',
    author: 'Nhóm sinh viên K66 AI',
    field: 'cntt',
    fieldName: 'Công nghệ thông tin',
    subject: 'Học máy',
    type: 'Bài tập',
    year: 2024,
    pages: 87,
    verification: 'silver',
    rating: 4.3,
    reviews: 234,
    downloads: 3421,
    views: 9823,
    institution: 'ĐH Quốc gia Hà Nội',
    description: 'Tổng hợp bài tập thực hành được giảng viên bộ môn kiểm duyệt.',
    size: '5.2 MB',
    format: 'PDF',
    tags: ['Machine Learning', 'Python'],
  },
  {
    id: 4,
    title: 'Cơ sở Dữ liệu - Đề cương ôn tập',
    author: 'Lê Thị Minh Thu',
    field: 'cntt',
    fieldName: 'Công nghệ thông tin',
    subject: 'Cơ sở dữ liệu',
    type: 'Tài liệu ôn tập',
    year: 2024,
    pages: 45,
    verification: 'bronze',
    rating: 4.1,
    reviews: 128,
    downloads: 2134,
    views: 6543,
    institution: 'Sinh viên đóng góp',
    description: 'Tài liệu tự biên soạn được cộng đồng đánh giá tốt.',
    size: '3.8 MB',
    format: 'PDF',
    tags: ['SQL', 'Database'],
  },
  {
    id: 5,
    title: 'Giải phẫu người - Atlas hình ảnh',
    author: 'GS. BS. Phạm Quốc Bảo',
    field: 'yk',
    fieldName: 'Y khoa',
    subject: 'Giải phẫu',
    type: 'Atlas',
    year: 2023,
    pages: 528,
    verification: 'gold',
    rating: 4.9,
    reviews: 2103,
    downloads: 12456,
    views: 31204,
    institution: 'ĐH Y Hà Nội',
    description: 'Atlas giải phẫu chính thức của Đại học Y Hà Nội, được thẩm định bởi hội đồng chuyên môn.',
    size: '124.6 MB',
    format: 'PDF',
    tags: ['Giải phẫu', 'Y học'],
  },
  {
    id: 6,
    title: 'Luật Dân sự 2015 - Bình luận',
    author: 'ThS. Hoàng Nam Phong',
    field: 'lu',
    fieldName: 'Luật',
    subject: 'Luật Dân sự',
    type: 'Chuyên khảo',
    year: 2024,
    pages: 234,
    verification: 'silver',
    rating: 4.5,
    reviews: 456,
    downloads: 4321,
    views: 11234,
    institution: 'ĐH Luật Hà Nội',
    description: 'Bình luận chuyên sâu về Bộ luật Dân sự 2015.',
    size: '8.9 MB',
    format: 'PDF',
    tags: ['Luật Dân sự', 'Pháp luật'],
  },
  {
    id: 7,
    title: 'Sức bền vật liệu - Bài giảng',
    author: 'TS. Vũ Đình Cường',
    field: 'kt-xd',
    fieldName: 'Kỹ thuật & Xây dựng',
    subject: 'Sức bền vật liệu',
    type: 'Bài giảng',
    year: 2024,
    pages: 178,
    verification: 'gold',
    rating: 4.6,
    reviews: 387,
    downloads: 3892,
    views: 9456,
    institution: 'ĐH Xây dựng',
    description: 'Bài giảng chính thức được Bộ môn Cơ học kỹ thuật phê duyệt.',
    size: '15.3 MB',
    format: 'PDF',
    tags: ['Cơ học', 'Vật liệu'],
  },
  {
    id: 8,
    title: 'Xác suất thống kê - 200 bài tập',
    author: 'Nguyễn Thanh Hương',
    field: 'tn',
    fieldName: 'Khoa học tự nhiên',
    subject: 'Xác suất thống kê',
    type: 'Bài tập',
    year: 2023,
    pages: 156,
    verification: 'bronze',
    rating: 4.0,
    reviews: 89,
    downloads: 1876,
    views: 4532,
    institution: 'Sinh viên đóng góp',
    description: 'Bộ bài tập chọn lọc tự biên soạn.',
    size: '4.1 MB',
    format: 'PDF',
    tags: ['Thống kê', 'Xác suất'],
  },
  {
    id: 9,
    title: 'Marketing căn bản - Philip Kotler',
    author: 'Dịch: Khoa Marketing ĐH NEU',
    field: 'kt',
    fieldName: 'Kinh tế',
    subject: 'Marketing',
    type: 'Sách dịch',
    year: 2023,
    pages: 487,
    verification: 'gold',
    rating: 4.8,
    reviews: 1543,
    downloads: 9234,
    views: 22145,
    institution: 'ĐH Kinh tế Quốc dân',
    description: 'Bản dịch chính thức được tác giả ủy quyền và Hội đồng Khoa học thẩm định.',
    size: '22.7 MB',
    format: 'PDF',
    tags: ['Marketing', 'Kinh doanh'],
  },
];

const VERIFICATION_LEVELS = {
  gold: {
    label: 'Xác thực Vàng',
    shortLabel: 'Vàng',
    color: '#C8102E',
    bgColor: '#FEF2F3',
    description: 'Được cơ sở đào tạo chính thức phê duyệt',
    criteria: [
      'Được Hội đồng Khoa học của cơ sở đào tạo thẩm định',
      'Tác giả là giảng viên/chuyên gia có học hàm, học vị',
      'Đã được kiểm tra trùng lặp và đạo văn',
      'Nội dung cập nhật trong vòng 3 năm',
    ],
  },
  silver: {
    label: 'Xác thực Bạc',
    shortLabel: 'Bạc',
    color: '#64748B',
    bgColor: '#F1F5F9',
    description: 'Được giảng viên bộ môn xác minh',
    criteria: [
      'Được giảng viên bộ môn kiểm tra nội dung',
      'Đánh giá cộng đồng từ 4.0 sao trở lên',
      'Có ít nhất 50 lượt đánh giá',
    ],
  },
  bronze: {
    label: 'Cộng đồng tin cậy',
    shortLabel: 'Đồng',
    color: '#B45309',
    bgColor: '#FEF3C7',
    description: 'Được cộng đồng đánh giá tốt',
    criteria: [
      'Đánh giá trung bình từ 3.5 sao trở lên',
      'Có ít nhất 20 lượt đánh giá',
      'Không có báo cáo vi phạm',
    ],
  },
};

// ============ COMPONENTS ============

function VerificationBadge({ level, size = 'md', showLabel = true }) {
  const config = VERIFICATION_LEVELS[level];
  if (!config) return null;

  const sizes = {
    sm: { icon: 12, padding: '2px 6px', font: '10px', gap: '3px' },
    md: { icon: 14, padding: '4px 10px', font: '11px', gap: '5px' },
    lg: { icon: 18, padding: '6px 14px', font: '13px', gap: '7px' },
  };
  const s = sizes[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.padding,
        backgroundColor: config.bgColor,
        color: config.color,
        borderRadius: '999px',
        fontSize: s.font,
        fontWeight: 600,
        letterSpacing: '0.02em',
        border: `1px solid ${config.color}20`,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7V12C3 16.5 6 20.5 12 22C18 20.5 21 16.5 21 12V7L12 2Z"
          fill={config.color}
        />
        <path
          d="M9 12L11 14L15 10"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showLabel && <span>{config.shortLabel}</span>}
    </span>
  );
}

function LargeVerificationSeal({ level }) {
  const config = VERIFICATION_LEVELS[level];
  if (!config) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: '140px',
        height: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer rotating ring */}
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        style={{
          position: 'absolute',
          animation: 'spin 20s linear infinite',
        }}
      >
        <defs>
          <path
            id="circlePath"
            d="M 70, 70 m -58, 0 a 58,58 0 1,1 116,0 a 58,58 0 1,1 -116,0"
          />
        </defs>
        <text fill={config.color} fontSize="9" fontWeight="600" letterSpacing="3">
          <textPath href="#circlePath">
            • ĐÃ XÁC MINH • {config.label.toUpperCase()} • ĐÃ XÁC MINH • {config.label.toUpperCase()} 
          </textPath>
        </text>
      </svg>

      {/* Inner seal */}
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 24px ${config.color}40, inset 0 -3px 8px rgba(0,0,0,0.1)`,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '4px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        />
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L3 7V12C3 16.5 6 20.5 12 22C18 20.5 21 16.5 21 12V7L12 2Z"
            fill="white"
          />
          <path
            d="M9 12L11 14L15 10"
            stroke={config.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// ============ SEARCH PAGE ============

function SearchPage({ onSelectDocument }) {
  const [selectedField, setSelectedField] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedVerification, setSelectedVerification] = useState([]);
  const [selectedType, setSelectedType] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredDocs = useMemo(() => {
    return DOCUMENTS.filter((doc) => {
      if (selectedField !== 'all' && doc.field !== selectedField) return false;
      if (selectedSubject && doc.subject !== selectedSubject) return false;
      if (selectedVerification.length > 0 && !selectedVerification.includes(doc.verification)) return false;
      if (selectedType.length > 0 && !selectedType.includes(doc.type)) return false;
      if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase()) && !doc.author.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.year - a.year;
      if (sortBy === 'popular') return b.downloads - a.downloads;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [selectedField, selectedSubject, selectedVerification, selectedType, searchQuery, sortBy]);

  const currentSubjects = selectedField !== 'all' ? SUBJECTS[selectedField] || [] : [];
  const docTypes = [...new Set(DOCUMENTS.map(d => d.type))];

  const activeFilterCount = 
    (selectedField !== 'all' ? 1 : 0) +
    (selectedSubject ? 1 : 0) +
    selectedVerification.length +
    selectedType.length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF9' }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E7E5E4',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#C8102E',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 700,
                  fontSize: '20px',
                  fontStyle: 'italic',
                }}
              >
                V
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#1C1917',
                    lineHeight: 1,
                  }}
                >
                  Veritas
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '10px',
                    color: '#78716C',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginTop: '2px',
                  }}
                >
                  Thư viện học thuật
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#A8A29E',
                }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu, tác giả, chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid #E7E5E4',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: '#FAFAF9',
                  outline: 'none',
                  transition: 'all 0.2s',
                  color: '#1C1917',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C8102E';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(200, 16, 46, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E7E5E4';
                  e.target.style.backgroundColor = '#FAFAF9';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#44403C',
                  cursor: 'pointer',
                }}
              >
                Đóng góp
              </button>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#C8102E',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                SV
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E7E5E4',
          padding: '48px 24px 40px',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ maxWidth: '600px' }}>
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#C8102E',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                — Khám phá tri thức
              </div>
              <h1
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontWeight: 400,
                  color: '#1C1917',
                  lineHeight: 1.1,
                  marginBottom: '16px',
                  letterSpacing: '-0.02em',
                }}
              >
                Tìm <em style={{ fontStyle: 'italic', color: '#C8102E' }}>tài liệu đáng tin cậy</em>{' '}
                cho hành trình học tập
              </h1>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  color: '#57534E',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Mỗi tài liệu được xác minh bởi giảng viên, chuyên gia và cộng đồng sinh viên.
                Dấu chứng nhận <VerificationBadge level="gold" size="sm" /> giúp bạn nhận biết nguồn đáng tin.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px' }}>
              {[
                { num: '2,847', label: 'Tài liệu' },
                { num: '1,203', label: 'Đã xác minh' },
                { num: '89', label: 'Cơ sở đào tạo' },
              ].map((stat, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: '32px',
                      fontWeight: 500,
                      color: '#1C1917',
                      lineHeight: 1,
                    }}
                  >
                    {stat.num}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: '#78716C',
                      marginTop: '4px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Field tabs */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E7E5E4',
          padding: '0 24px',
          position: 'sticky',
          top: '72px',
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {FIELDS.map((field) => (
            <button
              key={field.id}
              onClick={() => {
                setSelectedField(field.id);
                setSelectedSubject(null);
              }}
              style={{
                padding: '16px 20px',
                border: 'none',
                backgroundColor: 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: selectedField === field.id ? 600 : 500,
                color: selectedField === field.id ? '#C8102E' : '#57534E',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                position: 'relative',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {field.name}
              <span
                style={{
                  fontSize: '11px',
                  color: selectedField === field.id ? '#C8102E' : '#A8A29E',
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                {field.count}
              </span>
              {selectedField === field.id && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '20px',
                    right: '20px',
                    height: '2px',
                    backgroundColor: '#C8102E',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '32px 24px',
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '32px',
        }}
      >
        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Subjects */}
          {currentSubjects.length > 0 && (
            <div>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#78716C',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Môn học
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  onClick={() => setSelectedSubject(null)}
                  style={{
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: !selectedSubject ? '#FEF2F3' : 'transparent',
                    textAlign: 'left',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: !selectedSubject ? 600 : 500,
                    color: !selectedSubject ? '#C8102E' : '#44403C',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'all 0.15s',
                  }}
                >
                  Tất cả môn học
                </button>
                {currentSubjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: selectedSubject === subject ? '#FEF2F3' : 'transparent',
                      textAlign: 'left',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      fontWeight: selectedSubject === subject ? 600 : 500,
                      color: selectedSubject === subject ? '#C8102E' : '#44403C',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSubject !== subject) e.target.style.backgroundColor = '#FAFAF9';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSubject !== subject) e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verification filter */}
          <div>
            <h3
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                color: '#78716C',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Cấp độ xác minh
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(VERIFICATION_LEVELS).map(([key, config]) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAF9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <input
                    type="checkbox"
                    checked={selectedVerification.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVerification([...selectedVerification, key]);
                      } else {
                        setSelectedVerification(selectedVerification.filter((v) => v !== key));
                      }
                    }}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#C8102E',
                      cursor: 'pointer',
                    }}
                  />
                  <VerificationBadge level={key} size="sm" />
                </label>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div>
            <h3
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                color: '#78716C',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Loại tài liệu
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {docTypes.map((type) => (
                <label
                  key={type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: '#44403C',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAF9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <input
                    type="checkbox"
                    checked={selectedType.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedType([...selectedType, type]);
                      } else {
                        setSelectedType(selectedType.filter((t) => t !== type));
                      }
                    }}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#C8102E',
                      cursor: 'pointer',
                    }}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setSelectedField('all');
                setSelectedSubject(null);
                setSelectedVerification([]);
                setSelectedType([]);
                setSearchQuery('');
              }}
              style={{
                padding: '10px 14px',
                border: '1px solid #E7E5E4',
                backgroundColor: 'white',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: '#C8102E',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center',
              }}
            >
              <X size={14} /> Xóa bộ lọc ({activeFilterCount})
            </button>
          )}
        </aside>

        {/* Results */}
        <main>
          {/* Sort bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #E7E5E4',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: '22px',
                  fontWeight: 500,
                  color: '#1C1917',
                }}
              >
                {filteredDocs.length} tài liệu
              </div>
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  color: '#78716C',
                  marginTop: '2px',
                }}
              >
                {selectedField !== 'all' && FIELDS.find((f) => f.id === selectedField)?.name}
                {selectedSubject && ` · ${selectedSubject}`}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  color: '#78716C',
                }}
              >
                Sắp xếp
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 32px 8px 12px',
                  border: '1px solid #E7E5E4',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  color: '#1C1917',
                  fontWeight: 500,
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716C' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                <option value="relevance">Liên quan nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>
          </div>

          {/* Doc cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredDocs.length === 0 && (
              <div
                style={{
                  padding: '64px 24px',
                  textAlign: 'center',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #E7E5E4',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: '22px',
                    color: '#1C1917',
                    marginBottom: '8px',
                  }}
                >
                  Không tìm thấy tài liệu
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#78716C',
                  }}
                >
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </div>
              </div>
            )}

            {filteredDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onClick={() => onSelectDocument(doc)} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function DocumentCard({ doc, onClick }) {
  const [hovered, setHovered] = useState(false);
  const verification = VERIFICATION_LEVELS[doc.verification];

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'white',
        border: '1px solid #E7E5E4',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderColor: hovered ? '#C8102E' : '#E7E5E4',
        boxShadow: hovered ? '0 8px 24px rgba(200, 16, 46, 0.08)' : 'none',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        display: 'flex',
        gap: '20px',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          flexShrink: 0,
          width: '96px',
          height: '128px',
          borderRadius: '6px',
          background: `linear-gradient(135deg, ${verification.color}15, ${verification.color}05)`,
          border: `1px solid ${verification.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <FileText size={32} color={verification.color} strokeWidth={1.5} />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '6px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '9px',
            textAlign: 'center',
            color: '#78716C',
            backgroundColor: 'rgba(255,255,255,0.8)',
            letterSpacing: '0.05em',
          }}
        >
          {doc.format} · {doc.pages}p
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: '#78716C',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {doc.fieldName} · {doc.subject}
            </span>
            <VerificationBadge level={doc.verification} size="sm" />
          </div>
        </div>

        <h3
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '19px',
            fontWeight: 500,
            color: '#1C1917',
            marginBottom: '6px',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}
        >
          {doc.title}
        </h3>

        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: '#57534E',
            marginBottom: '10px',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          <User size={12} style={{ opacity: 0.6 }} /> {doc.author}
          <span style={{ color: '#D6D3D1' }}>·</span>
          <Building2 size={12} style={{ opacity: 0.6 }} /> {doc.institution}
        </div>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: '#78716C',
            lineHeight: 1.5,
            margin: '0 0 12px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {doc.description}
        </p>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#78716C',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={12} fill="#C8102E" stroke="#C8102E" />
            <span style={{ color: '#1C1917', fontWeight: 600 }}>{doc.rating}</span>
            <span>({doc.reviews.toLocaleString('vi-VN')})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={12} /> {doc.downloads.toLocaleString('vi-VN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={12} /> {doc.views.toLocaleString('vi-VN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> {doc.year}
          </div>
        </div>
      </div>
    </article>
  );
}

// ============ DETAIL PAGE ============

function DetailPage({ doc, onBack }) {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const verification = VERIFICATION_LEVELS[doc.verification];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF9' }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E7E5E4',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                border: '1px solid #E7E5E4',
                backgroundColor: 'white',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: '#44403C',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C8102E';
                e.currentTarget.style.color = '#C8102E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E7E5E4';
                e.currentTarget.style.color = '#44403C';
              }}
            >
              <ArrowLeft size={16} /> Trở lại tìm kiếm
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                style={{
                  padding: '8px',
                  border: '1px solid #E7E5E4',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#57534E',
                }}
                title="Lưu"
              >
                <Bookmark size={16} />
              </button>
              <button
                style={{
                  padding: '8px',
                  border: '1px solid #E7E5E4',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#57534E',
                }}
                title="Chia sẻ"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Verified banner */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: `1px solid #E7E5E4`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 50%, ${verification.color}08 0%, transparent 50%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '48px 24px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '48px',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#C8102E',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {doc.fieldName}
              </span>
              <ChevronRight size={14} color="#A8A29E" />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#78716C',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {doc.subject}
              </span>
              <ChevronRight size={14} color="#A8A29E" />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#78716C',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {doc.type}
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 'clamp(32px, 4vw, 44px)',
                fontWeight: 400,
                color: '#1C1917',
                lineHeight: 1.1,
                marginBottom: '20px',
                letterSpacing: '-0.02em',
              }}
            >
              {doc.title}
            </h1>

            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                color: '#44403C',
                marginBottom: '24px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <User size={14} style={{ opacity: 0.6 }} /> <strong>{doc.author}</strong>
              </span>
              <span style={{ color: '#D6D3D1' }}>·</span>
              <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Building2 size={14} style={{ opacity: 0.6 }} /> {doc.institution}
              </span>
              <span style={{ color: '#D6D3D1' }}>·</span>
              <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Calendar size={14} style={{ opacity: 0.6 }} /> {doc.year}
              </span>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '14px 28px',
                  border: 'none',
                  backgroundColor: '#C8102E',
                  color: 'white',
                  borderRadius: '10px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(200, 16, 46, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#A50E27';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#C8102E';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Download size={16} /> Tải xuống · {doc.size}
              </button>
              <button
                style={{
                  padding: '14px 24px',
                  border: '1px solid #E7E5E4',
                  backgroundColor: 'white',
                  color: '#1C1917',
                  borderRadius: '10px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Eye size={16} /> Đọc trực tuyến
              </button>
            </div>
          </div>

          {/* Seal */}
          <div
            onClick={() => setShowVerificationModal(true)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <LargeVerificationSeal level={doc.verification} />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: verification.color,
                  fontStyle: 'italic',
                }}
              >
                {verification.label}
              </div>
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  color: '#78716C',
                  marginTop: '2px',
                  textDecoration: 'underline',
                  textDecorationStyle: 'dotted',
                  textUnderlineOffset: '3px',
                }}
              >
                Xem chi tiết xác minh
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '40px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '40px',
        }}
      >
        {/* Left content */}
        <div>
          {/* Stats strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px',
              backgroundColor: '#E7E5E4',
              border: '1px solid #E7E5E4',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '32px',
            }}
          >
            {[
              { icon: Star, value: doc.rating, label: 'Đánh giá', sub: `${doc.reviews} review`, color: '#C8102E' },
              { icon: Download, value: doc.downloads.toLocaleString('vi-VN'), label: 'Tải xuống', color: '#1C1917' },
              { icon: Eye, value: doc.views.toLocaleString('vi-VN'), label: 'Lượt xem', color: '#1C1917' },
              { icon: FileText, value: doc.pages, label: 'Trang', sub: doc.format, color: '#1C1917' },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: 'white', padding: '20px' }}>
                <stat.icon size={16} color={stat.color} style={{ opacity: 0.8, marginBottom: '8px' }} />
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: '24px',
                    fontWeight: 500,
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    color: '#78716C',
                    marginTop: '6px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </div>
                {stat.sub && (
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      color: '#A8A29E',
                      marginTop: '2px',
                    }}
                  >
                    {stat.sub}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Description */}
          <section style={{ marginBottom: '40px' }}>
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                color: '#78716C',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Mô tả
            </h2>
            <p
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: '18px',
                lineHeight: 1.6,
                color: '#1C1917',
                margin: 0,
                fontWeight: 300,
              }}
            >
              {doc.description}
            </p>
          </section>

          {/* Verification journey */}
          <section
            style={{
              backgroundColor: 'white',
              border: '1px solid #E7E5E4',
              borderRadius: '12px',
              padding: '28px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <Shield size={18} color={verification.color} />
              <h2
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: '22px',
                  fontWeight: 500,
                  color: '#1C1917',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Hành trình xác minh
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                {
                  step: '01',
                  title: 'Tải lên bởi tác giả',
                  desc: `${doc.author} đã xác thực danh tính qua ${doc.institution}`,
                  date: `${doc.year - 0}-01-15`,
                  done: true,
                },
                {
                  step: '02',
                  title: 'Kiểm tra đạo văn',
                  desc: 'Độ tương đồng: 2.3% — Đạt ngưỡng cho phép',
                  date: `${doc.year - 0}-01-17`,
                  done: true,
                },
                {
                  step: '03',
                  title: 'Thẩm định chuyên môn',
                  desc: 'Được 3 giảng viên bộ môn đánh giá đạt tiêu chuẩn',
                  date: `${doc.year - 0}-01-23`,
                  done: true,
                },
                {
                  step: '04',
                  title: 'Hội đồng Khoa học phê duyệt',
                  desc: `Quyết định số 2024/QĐ-${doc.field.toUpperCase()}-HDKH`,
                  date: `${doc.year - 0}-02-05`,
                  done: doc.verification === 'gold',
                },
              ].map((step, i, arr) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    position: 'relative',
                    paddingBottom: i === arr.length - 1 ? 0 : '24px',
                  }}
                >
                  {/* Connector */}
                  {i < arr.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '15px',
                        top: '32px',
                        bottom: '0',
                        width: '2px',
                        backgroundColor: step.done ? verification.color : '#E7E5E4',
                        opacity: 0.3,
                      }}
                    />
                  )}

                  {/* Step indicator */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: step.done ? verification.color : '#F5F5F4',
                      color: step.done ? 'white' : '#A8A29E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      fontWeight: 600,
                      zIndex: 1,
                    }}
                  >
                    {step.done ? <Check size={14} /> : step.step}
                  </div>

                  <div style={{ flex: 1, paddingTop: '2px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        gap: '12px',
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: step.done ? '#1C1917' : '#A8A29E',
                          margin: 0,
                        }}
                      >
                        {step.title}
                      </h3>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '11px',
                          color: '#A8A29E',
                        }}
                      >
                        {step.done ? step.date : 'Đang chờ'}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        color: '#57534E',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tags */}
          <section style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                color: '#78716C',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Nhãn liên quan
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {doc.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: 'white',
                    border: '1px solid #E7E5E4',
                    borderRadius: '999px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#44403C',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#C8102E';
                    e.target.style.color = '#C8102E';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#E7E5E4';
                    e.target.style.color = '#44403C';
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          {/* Reviews preview */}
          <section
            style={{
              backgroundColor: 'white',
              border: '1px solid #E7E5E4',
              borderRadius: '12px',
              padding: '28px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: '22px',
                  fontWeight: 500,
                  color: '#1C1917',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Đánh giá từ sinh viên
              </h2>
              <button
                style={{
                  padding: '8px 14px',
                  border: '1px solid #E7E5E4',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#44403C',
                  cursor: 'pointer',
                }}
              >
                Xem tất cả ({doc.reviews})
              </button>
            </div>

            {[
              {
                name: 'Nguyễn Minh Tuấn',
                year: 'Sinh viên năm 3',
                rating: 5,
                date: '2 tuần trước',
                content: 'Tài liệu rất chi tiết, giải thích dễ hiểu. Đặc biệt là các ví dụ thực tế rất hữu ích cho kỳ thi.',
                likes: 23,
              },
              {
                name: 'Trần Thu Hà',
                year: 'Sinh viên năm 2',
                rating: 4,
                date: '1 tháng trước',
                content: 'Nội dung tốt, phần bài tập cuối chương rất hay. Mong có thêm lời giải cho các bài khó.',
                likes: 12,
              },
            ].map((review, i) => (
              <div
                key={i}
                style={{
                  padding: '16px 0',
                  borderTop: i === 0 ? 'none' : '1px solid #F5F5F4',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#FEF2F3',
                        color: '#C8102E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '13px',
                      }}
                    >
                      {review.name.split(' ').slice(-1)[0][0]}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#1C1917',
                        }}
                      >
                        {review.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          color: '#78716C',
                        }}
                      >
                        {review.year} · {review.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        size={12}
                        fill={j < review.rating ? '#C8102E' : 'transparent'}
                        stroke={j < review.rating ? '#C8102E' : '#D6D3D1'}
                      />
                    ))}
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#44403C',
                    margin: '0 0 8px 0',
                    lineHeight: 1.5,
                  }}
                >
                  {review.content}
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    style={{
                      border: 'none',
                      background: 'none',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: '#78716C',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <ThumbsUp size={12} /> Hữu ích ({review.likes})
                  </button>
                  <button
                    style={{
                      border: 'none',
                      background: 'none',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: '#78716C',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <MessageCircle size={12} /> Trả lời
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Right sidebar */}
        <aside>
          <div style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Trust card */}
            <div
              style={{
                backgroundColor: verification.bgColor,
                border: `1px solid ${verification.color}30`,
                borderRadius: '12px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: verification.color,
                  opacity: 0.08,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Award size={18} color={verification.color} />
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: verification.color,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Cấp độ tin cậy
                </div>
              </div>
              <div
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: '28px',
                  fontWeight: 500,
                  color: verification.color,
                  fontStyle: 'italic',
                  marginBottom: '4px',
                  letterSpacing: '-0.01em',
                }}
              >
                {verification.label}
              </div>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  color: '#44403C',
                  margin: '0 0 16px 0',
                  lineHeight: 1.5,
                }}
              >
                {verification.description}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                {verification.criteria.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: '#44403C',
                      lineHeight: 1.4,
                    }}
                  >
                    <Check size={14} color={verification.color} style={{ flexShrink: 0, marginTop: '1px' }} />
                    {c}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowVerificationModal(true)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${verification.color}`,
                  backgroundColor: 'white',
                  color: verification.color,
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = verification.color;
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = verification.color;
                }}
              >
                Tìm hiểu về hệ thống xác minh <ExternalLink size={12} />
              </button>
            </div>

            {/* Document info */}
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid #E7E5E4',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#78716C',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Thông tin tài liệu
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Loại', value: doc.type },
                  { label: 'Định dạng', value: doc.format },
                  { label: 'Kích thước', value: doc.size },
                  { label: 'Số trang', value: doc.pages },
                  { label: 'Năm phát hành', value: doc.year },
                  { label: 'Ngôn ngữ', value: 'Tiếng Việt' },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      paddingBottom: '8px',
                      borderBottom: i === 5 ? 'none' : '1px solid #F5F5F4',
                    }}
                  >
                    <span style={{ color: '#78716C' }}>{item.label}</span>
                    <span style={{ color: '#1C1917', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div
          onClick={() => setShowVerificationModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 25, 23, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <div
              style={{
                padding: '32px',
                borderBottom: '1px solid #E7E5E4',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowVerificationModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  backgroundColor: '#F5F5F4',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#78716C',
                }}
              >
                <X size={16} />
              </button>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <LargeVerificationSeal level={doc.verification} />
              </div>
              <h2
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: '28px',
                  fontWeight: 500,
                  color: '#1C1917',
                  textAlign: 'center',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.01em',
                }}
              >
                Đây là <em style={{ color: verification.color, fontStyle: 'italic' }}>{verification.label}</em>
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: '#57534E',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {verification.description}. Đây là cấp độ chứng nhận cao nhất trong hệ thống Veritas.
              </p>
            </div>

            <div style={{ padding: '32px' }}>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#78716C',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                Tất cả các cấp độ xác minh
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(VERIFICATION_LEVELS).map(([key, config]) => (
                  <div
                    key={key}
                    style={{
                      padding: '16px',
                      border: `1px solid ${key === doc.verification ? config.color : '#E7E5E4'}`,
                      borderRadius: '10px',
                      backgroundColor: key === doc.verification ? config.bgColor : 'white',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px',
                      }}
                    >
                      <VerificationBadge level={key} size="md" />
                      {key === doc.verification && (
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '10px',
                            fontWeight: 700,
                            color: config.color,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          · Tài liệu này
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        color: '#44403C',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {config.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ ROOT APP ============

export default function App() {
  const [currentDoc, setCurrentDoc] = useState(null);

  return (
    <>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D6D3D1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #A8A29E; }
      `}</style>
      {currentDoc ? (
        <DetailPage doc={currentDoc} onBack={() => setCurrentDoc(null)} />
      ) : (
        <SearchPage onSelectDocument={setCurrentDoc} />
      )}
    </>
  );
}

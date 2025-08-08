import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProcedures, getCategories, searchProcedures } from '../../../shared/api/api';
import './ProceduresPage.css';

const ProceduresPage = () => {
    const [procedures, setProcedures] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredProcedures, setFilteredProcedures] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);



    const fetchData = async () => {
        try {
            const [proceduresRes, categoriesRes] = await Promise.all([
                getProcedures(),
                getCategories()
            ]);
            setProcedures(proceduresRes.data.procedures || []);
            setCategories(categoriesRes.data.categories || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };


    // Lọc theo danh mục (không realtime)
    const filterByCategory = (proceduresList, category) => {
        if (!category) return proceduresList;
        return proceduresList.filter(p => p.category === category);
    };


    // Khi bấm nút tìm kiếm
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let result = procedures;
            // Nếu có searchQuery thì gọi API search, ngược lại lấy toàn bộ procedures
            if (searchQuery.trim()) {
                const response = await searchProcedures(searchQuery);
                result = response.data.procedures || [];
            }
            // Lọc theo category nếu có
            result = filterByCategory(result, selectedCategory);
            setFilteredProcedures(result);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Khi đổi danh mục thì lọc lại (nếu đã có kết quả tìm kiếm)
    useEffect(() => {
        // Nếu chưa từng tìm kiếm thì lấy toàn bộ procedures theo category
        if (!searchQuery.trim()) {
            setFilteredProcedures(filterByCategory(procedures, selectedCategory));
        } else {
            // Nếu đã có kết quả tìm kiếm thì lọc lại trên filteredProcedures
            setFilteredProcedures(prev => filterByCategory(prev, selectedCategory));
        }
        // eslint-disable-next-line
    }, [selectedCategory, procedures]);

    if (loading) {
        return (
            <div className='procedures-page'>
                <div className='loading-container'>
                    <div className='loading-spinner'></div>
                    <p>Đang tải danh sách quy trình...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='procedures-page'>
            <div className='page-header'>
                <h1>📋 Danh sách Quy trình Nội bộ</h1>
                <p>Tìm kiếm và tra cứu các quy trình công ty</p>
            </div>

            <div className='search-section'>
                <form onSubmit={handleSearch} className='search-form'>
                    <input
                        type='text'
                        placeholder='Tìm kiếm quy trình...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='search-input'
                    />
                    <button type='submit' className='search-button'>
                        🔍 Tìm kiếm
                    </button>
                </form>

                <div className='filter-section'>
                    <label>Lọc theo danh mục:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className='category-select'
                    >
                        <option value=''>Tất cả danh mục</option>
                        {categories.map(category => (
                            <option key={category._id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className='procedures-grid'>
                {filteredProcedures.length > 0 ? (
                    filteredProcedures.map(procedure => (
                        <div key={procedure._id} className='procedure-card'>
                            <div className='procedure-header'>
                                <h3>{procedure.title}</h3>
                                <span className='procedure-category'>{procedure.category}</span>
                            </div>
                            <p className='procedure-description'>
                                {procedure.description || 'Không có mô tả'}
                            </p>
                            <div className='procedure-meta'>
                                <span className='procedure-date'>
                                    📅 {new Date(procedure.created_at).toLocaleDateString('vi-VN')}
                                </span>
                                <span className='procedure-views'>
                                    👁️ {procedure.views || 0} lượt xem
                                </span>
                            </div>
                            <div className='procedure-actions'>
                                <Link 
                                    to={`/procedures/${procedure._id}`} 
                                    className='view-button'
                                >
                                    📖 Xem chi tiết
                                </Link>
                                <Link 
                                    to={`/chat`}
                                    className='ask-ai-button'
                                >
                                    🤖 Hỏi AI về quy trình
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='no-procedures'>
                        <div className='no-procedures-icon'>📋</div>
                        <h3>Không tìm thấy quy trình nào</h3>
                        <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục</p>
                    </div>
                )}
            </div>

            <div className='quick-help'>
                <div className='help-card'>
                    <h3>💡 Không tìm thấy quy trình bạn cần?</h3>
                    <p>Hãy thử hỏi AI hoặc liên hệ bộ phận IT</p>
                    <div className='help-actions'>
                        <Link to='/chat' className='help-button primary'>
                            🤖 Hỏi AI
                        </Link>
                        <Link to='/contact' className='help-button secondary'>
                            📞 Liên hệ IT
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProceduresPage;

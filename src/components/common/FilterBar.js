import React from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa';

const Container = styled.div`
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const SearchWrapper = styled.div`
  flex: 1;
  position: relative;
  min-width: 200px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #95a5a6;
  }

  input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #4CAF50;
    }
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  min-width: 150px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #95a5a6;
  }

  select {
    width: 100%;
    padding: 12px 12px 12px 35px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    cursor: pointer;
    background: white;
    appearance: none; /* Default arrow hide on some browsers */

    &:focus {
      border-color: #4CAF50;
    }
  }
`;

const FilterBar = ({
    onSearch,
    onFilterChange,
    onSortChange,
    filterOptions = [],
    sortOptions = [],
    placeholder = "Ara..."
}) => {
    return (
        <Container>
            <SearchWrapper>
                <FaSearch />
                <input
                    type="text"
                    placeholder={placeholder}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </SearchWrapper>

            {filterOptions.length > 0 && (
                <SelectWrapper>
                    <FaFilter size={12} />
                    <select onChange={(e) => onFilterChange(e.target.value)}>
                        <option value="">Tüm Durumlar</option>
                        {filterOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </SelectWrapper>
            )}

            {sortOptions.length > 0 && (
                <SelectWrapper>
                    <FaSortAmountDown size={12} />
                    <select onChange={(e) => onSortChange(e.target.value)}>
                        <option value="">Sıralama</option>
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </SelectWrapper>
            )}
        </Container>
    );
};

export default FilterBar;

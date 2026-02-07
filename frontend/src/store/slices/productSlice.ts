import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category, Brand, ProductFilters, PaginatedResponse } from '../../types';
import { productService } from '../../services';

interface ProductState {
    products: Product[];
    featuredProducts: Product[];
    bestSellers: Product[];
    newArrivals: Product[];
    categories: Category[];
    brands: Brand[];
    currentProduct: Product | null;
    relatedProducts: Product[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | null;
    filters: ProductFilters;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: [],
    featuredProducts: [],
    bestSellers: [],
    newArrivals: [],
    categories: [],
    brands: [],
    currentProduct: null,
    relatedProducts: [],
    pagination: null,
    filters: {},
    isLoading: false,
    error: null,
};

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (filters: ProductFilters | undefined, { rejectWithValue }) => {
        try {
            const response = await productService.getProducts(filters);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
        }
    }
);

export const fetchProduct = createAsyncThunk(
    'products/fetchProduct',
    async (slug: string, { rejectWithValue }) => {
        try {
            const product = await productService.getProduct(slug);
            return product;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
        }
    }
);

export const fetchFeaturedProducts = createAsyncThunk(
    'products/fetchFeaturedProducts',
    async (_, { rejectWithValue }) => {
        try {
            const products = await productService.getFeaturedProducts();
            return products;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
        }
    }
);

export const fetchBestSellers = createAsyncThunk(
    'products/fetchBestSellers',
    async (_, { rejectWithValue }) => {
        try {
            const products = await productService.getBestSellers();
            return products;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch best sellers');
        }
    }
);

export const fetchNewArrivals = createAsyncThunk(
    'products/fetchNewArrivals',
    async (_, { rejectWithValue }) => {
        try {
            const products = await productService.getNewArrivals();
            return products;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch new arrivals');
        }
    }
);

export const fetchRelatedProducts = createAsyncThunk(
    'products/fetchRelatedProducts',
    async (productId: number, { rejectWithValue }) => {
        try {
            const products = await productService.getRelatedProducts(productId);
            return products;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch related products');
        }
    }
);

export const fetchCategories = createAsyncThunk(
    'products/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const categories = await productService.getCategories();
            return categories;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
        }
    }
);

export const fetchBrands = createAsyncThunk(
    'products/fetchBrands',
    async (_, { rejectWithValue }) => {
        try {
            const brands = await productService.getBrands();
            return brands;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch brands');
        }
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<ProductFilters>) => {
            state.filters = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {};
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
            state.relatedProducts = [];
        },
        clearError: (state) => {
            state.error = null;
        },
        hydrateProduct: (state, action: PayloadAction<Product>) => {
            state.currentProduct = action.payload;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.data;
                state.pagination = action.payload.meta;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Product
            .addCase(fetchProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Featured Products
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.featuredProducts = action.payload || [];
            })
            // Best Sellers
            .addCase(fetchBestSellers.fulfilled, (state, action) => {
                state.bestSellers = action.payload || [];
            })
            // New Arrivals
            .addCase(fetchNewArrivals.fulfilled, (state, action) => {
                state.newArrivals = action.payload || [];
            })
            // Related Products
            .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
                state.relatedProducts = action.payload || [];
            })
            // Categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload || [];
            })
            // Brands
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.brands = action.payload || [];
            });
    },
});

export const { setFilters, clearFilters, clearCurrentProduct, clearError, hydrateProduct } = productSlice.actions;
export default productSlice.reducer;

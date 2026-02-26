# Best Practices & Development Guidelines

## 📋 Code Quality

### Backend Best Practices

#### 1. Error Handling
```javascript
// ❌ Bad
app.get('/users/:id', (req, res) => {
  const user = db.getUser(req.params.id);
  res.json(user);
});

// ✅ Good
app.get('/users/:id', async (req, res) => {
  try {
    const user = await db.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

#### 2. Input Validation
```javascript
// ❌ Bad
app.post('/orders', (req, res) => {
  const order = createOrder(req.body);
  res.json(order);
});

// ✅ Good
app.post('/orders', authenticate, authorize(['BUYER']), (req, res) => {
  const { vendorId, items, totalPrice } = req.body;
  
  if (!vendorId || !items?.length || !totalPrice) {
    return res.status(400).json({ message: 'Invalid input' });
  }
  
  const order = createOrder({ vendorId, items, totalPrice });
  res.json(order);
});
```

#### 3. Async/Await Pattern
```javascript
// ✅ Always use async/await for cleaner code
const getVendors = async () => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { status: 'ACTIVE' }
    });
    return vendors;
  } catch (error) {
    throw new Error('Database error');
  }
};
```

#### 4. Database Query Optimization
```javascript
// ❌ N+1 Query Problem
const vendors = await prisma.vendor.findMany();
const reviews = await Promise.all(
  vendors.map(v => prisma.review.findMany({ where: { vendorId: v.id } }))
);

// ✅ Use include to fetch related data
const vendors = await prisma.vendor.findMany({
  include: {
    menus: true,
    reviews: { take: 5 }
  }
});
```

#### 5. Use Middleware Properly
```javascript
// ✅ Stack middleware in correct order
app.use(cors());
app.use(express.json());
app.use(authenticate);           // Auth before routes
app.use(errorHandler);           // Error handler last

app.get('/protected', authorize(['ADMIN']), handler);
```

### Frontend Best Practices

#### 1. Component Organization
```javascript
// ✅ Organize component structure
export default function OrderCard({ order, onView, onRate }) {
  // 1. State
  const [loading, setLoading] = useState(false);
  
  // 2. Effects
  useEffect(() => {
    loadOrder();
  }, [order.id]);
  
  // 3. Event handlers
  const handleView = () => { /* ... */ };
  
  // 4. Render
  return <div>{/* JSX */}</div>;
}
```

#### 2. State Management with Zustand
```javascript
// ✅ Keep store focused
const useOrderStore = create((set) => ({
  orders: [],
  selectedOrder: null,
  
  // Actions
  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
}));

// Usage
const orders = useOrderStore(state => state.orders);
const setOrders = useOrderStore(state => state.setOrders);
```

#### 3. API Calls with Error Handling
```javascript
// ✅ Centralized error handling
const handleCreateOrder = async () => {
  try {
    setLoading(true);
    const response = await orderService.create(orderData);
    setOrders([...orders, response.data.order]);
    toast.success('Order created!');
  } catch (error) {
    const message = error.response?.data?.message || 'Error creating order';
    toast.error(message);
  } finally {
    setLoading(false);
  }
};
```

#### 4. Conditional Rendering
```javascript
// ❌ Bad
return <div>{loading && <LoadingSkeleton />}{data && <Component data={data} />}</div>;

// ✅ Good
if (loading) return <LoadingSkeleton />;
if (!data) return <NotFound />;
return <Component data={data} />;
```

#### 5. Props Validation
```javascript
// ✅ Always validate props
function VendorCard({ vendor, onSelect }) {
  if (!vendor) return <div>Vendor not found</div>;
  if (typeof onSelect !== 'function') return null;
  
  return <div onClick={() => onSelect(vendor)}>...</div>;
}
```

---

## 🔒 Security Best Practices

### Backend Security

```javascript
// 1. Input validation & sanitization
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 2. Hash passwords
const passwordHash = await bcrypt.hash(password, 10);

// 3. Use environment variables
const secret = process.env.JWT_SECRET;

// 4. Protect sensitive endpoints
app.delete('/users/:id', authenticate, authorize(['ADMIN']), handler);

// 5. Rate limiting (Future)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// 6. HTTPS only (Production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  next();
});
```

### Frontend Security

```javascript
// 1. Validate user input
if (!email.includes('@')) return { error: 'Invalid email' };

// 2. XSS prevention (React does this by default)
// Never use dangerouslySetInnerHTML
return <div>{userInput}</div>; // Safe!

// 3. Secure token storage
localStorage.setItem('token', token); // Simple but exposed to XSS
// Better: Use httpOnly cookies (backend sets)

// 4. Validate API responses
const response = await api.get('/data');
if (!Array.isArray(response.data.items)) {
  throw new Error('Invalid response');
}

// 5. CORS configuration (Backend)
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

---

## 📈 Performance Best Practices

### Database Performance

```javascript
// 1. Add indexes
// Already done in Prisma schema with @index decorators

// 2. Select only needed fields
await prisma.user.findMany({
  select: { id: true, name: true, email: true }
  // Don't fetch password & unnecessary fields
});

// 3. Use pagination
await prisma.order.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' }
});

// 4. Use transactions for consistency
await prisma.$transaction(async (tx) => {
  await tx.order.create({ /* ... */ });
  await tx.vendor.update({ /* ... */ });
});
```

### Frontend Performance

```javascript
// 1. Code splitting
const VendorMap = lazy(() => import('./VendorMap'));

// 2. Image lazy loading
<img src={url} loading="lazy" alt="..." />

// 3. Memoization
const VendorCard = memo(({ vendor }) => {
  return <div>{vendor.name}</div>;
});

// 4. Virtual scrolling for large lists
// Use react-window for long lists

// 5. Debounce search
const handleSearch = debounce((query) => {
  searchVendors(query);
}, 300);
```

---

## 🧪 Testing Guidelines

### Backend Unit Tests
```javascript
// Test example structure
describe('authController', () => {
  it('should register new user', async () => {
    const result = await authController.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123'
    });
    
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
  });
});
```

### Frontend Component Tests
```javascript
// Component test example
describe('<VendorCard />', () => {
  it('should render vendor name', () => {
    const { getByText } = render(
      <VendorCard vendor={{ name: 'Test Vendor' }} />
    );
    expect(getByText('Test Vendor')).toBeInTheDocument();
  });
});
```

---

## 🔄 Git Workflow

### Commit Messages
```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(vendor): add GPS tracking"
git commit -m "fix(auth): JWT validation bug"
git commit -m "docs: update API documentation"
git commit -m "refactor(db): optimize query performance"

# Types: feat, fix, docs, refactor, perf, test, chore
```

### Branch Strategy
```bash
# Main branches
main              # Production-ready code
develop           # Development branch

# Feature branches
feature/add-payment
feature/improve-maps
hotfix/auth-bug
```

---

## 📝 Documentation Standards

### Code Comments
```javascript
// ❌ Bad - obvious comment
const age = 18; // Set age to 18

// ✅ Good - explain WHY, not WHAT
const LEGAL_AGE = 18; // Minimum age for vendor registration in Indonesia

// ✅ Good - document complex logic
// Haversine formula to calculate distance between two GPS coordinates
// Accuracy: ±0.5% for distances < 1000km
const distance = calculateDistance(lat1, lon1, lat2, lon2);
```

### API Documentation
```javascript
/**
 * Get all active vendors
 * 
 * @route GET /api/vendors/active
 * @returns {Array<Vendor>} List of active vendors
 * @throws {Error} 500 - Internal server error
 */
app.get('/api/vendors/active', getActiveVendors);
```

### README Files
Every module should have a README explaining:
- What it does
- How to use it
- Examples
- Common issues

---

## 🚀 Deployment Checklist

Before deploying to production:

```markdown
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security audit
- [ ] Performance tested
- [ ] Database backups configured
- [ ] Logging configured
- [ ] Error tracking (Sentry) setup
- [ ] Environment variables set
- [ ] HTTPS/TLS enabled
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Database migrations run
- [ ] Cache strategy configured
- [ ] CDN setup (if needed)
- [ ] Monitoring configured
- [ ] Documentation updated
```

---

## 🐛 Common Pitfalls to Avoid

### Backend
- ❌ Storing passwords in plain text → Hash with bcrypt
- ❌ Trusting user input → Always validate
- ❌ Exposing error details → Log privately, return generic message
- ❌ N+1 queries → Use includes/joins
- ❌ Blocking I/O → Use async/await
- ❌ No error handling → Use try/catch
- ❌ Hardcoded secrets → Use environment variables

### Frontend
- ❌ Global state for everything → Use local state when possible
- ❌ No loading states → Always show loading indicator
- ❌ Ignoring API errors → Handle all error cases
- ❌ Unnecessary re-renders → Use React.memo, useMemo
- ❌ Hardcoded API URLs → Use environment variables
- ❌ No error boundaries → Wrap component trees
- ❌ Direct DOM manipulation → Use React patterns

---

## 📚 Learning Resources

### Recommended Reading
1. **Clean Code** - Robert C. Martin
2. **Design Patterns** - Gang of Four
3. **You Don't Know JS** - Kyle Simpson
4. **OWASP Top 10** - Security best practices
5. **Node.js Best Practices** - Official guide

### Online Resources
- MDN Web Docs - Frontend standards
- Node.js Documentation - Backend
- Prisma Documentation - Database ORM
- React Official Guide - Frontend framework
- Docker Documentation - Containerization

---

## 💡 Tips for Maintenance

1. **Code Review**: Always review code before merging
2. **Testing**: Write tests alongside features
3. **Documentation**: Keep docs updated with code
4. **Refactoring**: Improve code quality regularly
5. **Monitoring**: Set up alerts for errors
6. **Backup**: Regular database backups
7. **Updates**: Keep dependencies updated
8. **Security**: Regular security audits

---

**Version**: 1.0  
**Last Updated**: February 2026

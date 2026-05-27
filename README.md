# Fullstack Developer Test

---

## 1. Giải thích về Dependency Injection (DI)

### Dependency Injection là gì?
Dependency Injection là một design pattern được sử dụng để hiện thực hóa Inversion of Control (IoC) giữa các class và các phụ thuộc (dependencies) của chúng. Thay vì một class tự khởi tạo các thành phần nó cần, các thành phần đó sẽ được "tiêm" (inject) vào class từ bên ngoài (thường là qua Constructor).

### Cách sử dụng trong .NET Core:
.NET Core tích hợp sẵn một bộ Dependency Injection container.
1. **Đăng ký dịch vụ**: Trong file `Program.cs` (hoặc `Startup.cs`), chúng ta đăng ký các service vào `IServiceCollection`.
   - `AddTransient`: Tạo mới mỗi khi được yêu cầu.
   - `AddScoped`: Tạo mới một lần trong mỗi scope (thường là một HTTP Request).
   - `AddSingleton`: Chỉ tạo một lần duy nhất cho toàn bộ vòng đời ứng dụng.
   ```csharp
   builder.Services.AddScoped<IMyService, MyService>();
   ```
2. **Sử dụng**: Inject qua Constructor của Controller hoặc Service khác.
   ```csharp
   public class MyController : ControllerBase {
       private readonly IMyService _myService;
       public MyController(IMyService myService) {
           _myService = myService;
       }
   }
   ```

### .NET Framework có hỗ trợ trực tiếp không?
- **Không**: .NET Framework nguyên bản không tích hợp sẵn bộ DI container mạnh mẽ như .NET Core.
- **Cách xử lý**:
  - Sử dụng các thư viện bên thứ ba (Third-party IoC Containers) như: **Autofac, Unity, Ninject, Castle Windsor**.
  - Trong ASP.NET MVC hoặc Web API, ta cần cài đặt một `DependencyResolver` để kết nối các thư viện này với framework.

---

## 2. Xử lý mảng Object học sinh (C#)

### Khởi tạo Class và Array dữ liệu ngẫu nhiên
```csharp
public class Score {
    public double Math { get; set; }
    public double Physic { get; set; }
    public double Chemistry { get; set; }
    public double Average => (Math + Physic + Chemistry) / 3.0;
}

public class Student {
    public string Name { get; set; }
    public Score Score { get; set; }
}

// Khởi tạo dữ liệu ngẫu nhiên
Random rand = new Random();
Student[] students = new Student[10];
for (int i = 0; i < 10; i++) {
    students[i] = new Student {
        Name = "Student " + (char)rand.Next(65, 91),
        Score = new Score {
            Math = rand.Next(0, 11),
            Physic = rand.Next(0, 11),
            Chemistry = rand.Next(0, 11)
        }
    };
}
```

### Sắp xếp mảng (Sử dụng thuật toán QuickSort - Không dùng hàm Sort có sẵn)
```csharp
void QuickSort(Student[] arr, int left, int right) {
    if (left >= right) return;
    Student pivot = arr[(left + right) / 2];
    int i = left, j = right;
    while (i <= j) {
        while (Compare(arr[i], pivot) < 0) i++;
        while (Compare(arr[j], pivot) > 0) j--;
        if (i <= j) {
            Student temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            i++; j--;
        }
    }
    QuickSort(arr, left, j);
    QuickSort(arr, i, right);
}

int Compare(Student a, Student b) {
    // Ưu tiên 1: Điểm trung bình giảm dần
    if (a.Score.Average > b.Score.Average) return -1;
    if (a.Score.Average < b.Score.Average) return 1;
    // Ưu tiên 2: Tên tăng dần (Alphabet)
    return string.Compare(a.Name, b.Name);
}
```

### Tìm kiếm nhanh nhất Object có điểm trung bình bằng 8 (Binary Search)
Vì mảng đã được sắp xếp theo điểm trung bình, Binary Search là cách nhanh nhất (O(log n)).
```csharp
Student FindStudentByAverage(Student[] arr, double target) {
    int left = 0, right = arr.Length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        // Do mảng sắp xếp giảm dần theo điểm
        if (Math.Abs(arr[mid].Score.Average - target) < 0.001) return arr[mid];
        if (arr[mid].Score.Average < target) right = mid - 1;
        else left = mid + 1;
    }
    return null;
}
```

---

## 3. Tối ưu truy vấn SQL với 10 triệu bản ghi/ngày

Để xử lý lượng dữ liệu khổng lồ này, cần áp dụng các chiến lược sau:

1.  **Table Partitioning (Phân vùng bảng)**:
    - Phân chia bảng theo thời gian (ví dụ: mỗi ngày hoặc mỗi tháng một partition).
    - Giúp SQL Server chỉ quét các vùng dữ liệu liên quan thay vì toàn bộ bảng lớn.
2.  **Indexing (Chỉ mục)**:
    - **Clustered Index**: Đặt trên cột thời gian (EventTime) hoặc Id tăng dần.
    - **Non-Clustered Index**: Chỉ tạo trên các cột hay dùng để lọc/tìm kiếm.
    - **Columnstore Index**: Phù hợp cho các bảng dữ liệu lịch sử lớn dùng để báo cáo/thống kê (giúp nén dữ liệu và truy vấn cực nhanh).
3.  **Data Archiving (Lưu trữ lịch sử)**:
    - Di chuyển dữ liệu cũ (ví dụ sau 30 ngày) sang các bảng History hoặc hệ thống lưu trữ rẻ hơn.
4.  **Database Sharding**:
    - Chia nhỏ database ra nhiều server vật lý khác nhau dựa trên một Key (ví dụ: ClientId).
5.  **Tối ưu truy vấn**:
    - Tránh dùng `SELECT *`, chỉ lấy các cột cần thiết.
    - Sử dụng `NoLock` (trong SQL Server) nếu chấp nhận đọc dữ liệu chưa commit để tăng tốc độ truy vấn đọc.
    - Sử dụng các công cụ giám sát (Execution Plan) để phát hiện và sửa các đoạn code gây chậm (Scans thay vì Seeks).
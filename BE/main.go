package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// --- MODEL SDG ---
type UMKMData struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	MetricsName string  `gorm:"type:varchar(100)" json:"metrics_name"`
	Value       float64 `json:"value"`
	Unit        string  `json:"unit"`
	Status      string  `json:"status"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
}

type MarketTrend struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	Keyword   string  `json:"keyword"`
	GrowthPct float64 `json:"growth_pct"`
	Volume    int     `json:"volume"`
}

// --- MODEL BARU: KEUANGAN & STOK BARANG ---
type Transaction struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Type        string  `gorm:"type:varchar(20)" json:"type"` // "INCOME" atau "EXPENSE"
	Amount      float64 `gorm:"type:double" json:"amount"`
	Description string  `gorm:"type:varchar(255)" json:"description"`
	Date        string  `gorm:"type:varchar(50)" json:"date"`
}

type Product struct {
	ID    uint    `gorm:"primaryKey" json:"id"`
	Name  string  `gorm:"type:varchar(100)" json:"name"`
	Stock int     `json:"stock"`
	Price float64 `gorm:"type:double" json:"price"`
}

var DB *gorm.DB

func InitDB() {
	dsn := "root:P@ssw0rd@tcp(127.0.0.1:3306)/umkm_dashboard?charset=utf8mb4&parseTime=True&loc=Local"
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Gagal koneksi ke MySQL: %v", err)
	}

	DB.AutoMigrate(&UMKMData{}, &MarketTrend{}, &Transaction{}, &Product{})
	log.Println("Database & Tabel Baru Berhasil Dimigrasi!")
}

func main() {
	InitDB()

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, PUT, DELETE", // Membuka akses untuk PUT dan DELETE
	}))

	// --- ENDPOINT DASHBOARD & TRENDS ---
	app.Get("/api/dashboard/metrics", func(c *fiber.Ctx) error {
		metrics := []fiber.Map{
			{"id": 1, "metrics_name": "Efisiensi Operasional", "value": 84.5, "unit": "%", "status": "Optimal", "category": "Finance", "description": "Sistem aktif. Siap merekam transaksi."},
			{"id": 2, "metrics_name": "Digitalisasi Stok", "value": 62.1, "unit": "%", "status": "Warning", "category": "Finance", "description": "Modul inventaris telah diinisialisasi."},
		}
		return c.JSON(metrics)
	})

	// READ (Get All Market Trends) - SEKARANG AMBIL DARI DB
	app.Get("/api/dashboard/trends", func(c *fiber.Ctx) error {
		var trends []MarketTrend
		DB.Order("growth_pct desc").Find(&trends)
		return c.JSON(trends)
	})

	// CREATE Trend Baru
	app.Post("/api/dashboard/trends", func(c *fiber.Ctx) error {
		trend := new(MarketTrend)
		if err := c.BodyParser(trend); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Input tidak valid"})
		}
		DB.Create(&trend)
		return c.JSON(trend)
	})

	// DELETE Trend
	app.Delete("/api/dashboard/trends/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var trend MarketTrend
		if err := DB.First(&trend, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Data tidak ditemukan"})
		}
		DB.Delete(&trend)
		return c.JSON(fiber.Map{"status": "success", "message": "Tren berhasil dihapus"})
	})

	// =========================================
	// --- ENDPOINT KEUANGAN (FINANCE) ---
	// =========================================

	// READ (Get All)
	app.Get("/api/finance", func(c *fiber.Ctx) error {
		var txs []Transaction
		DB.Order("id desc").Find(&txs)
		return c.JSON(txs)
	})

	// CREATE (Post)
	app.Post("/api/finance", func(c *fiber.Ctx) error {
		tx := new(Transaction)
		if err := c.BodyParser(tx); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Input tidak valid"})
		}
		tx.Date = time.Now().Format("2006-01-02 15:04:05")
		DB.Create(&tx)
		return c.JSON(tx)
	})

	// UPDATE (Put) -> BARU
	app.Put("/api/finance/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var tx Transaction
		if err := DB.First(&tx, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Data transaksi tidak ditemukan"})
		}
		if err := c.BodyParser(&tx); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Input data edit tidak valid"})
		}
		DB.Save(&tx)
		return c.JSON(tx)
	})

	// DELETE (Delete) -> BARU
	app.Delete("/api/finance/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var tx Transaction
		if err := DB.First(&tx, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Data transaksi tidak ditemukan"})
		}
		DB.Delete(&tx)
		return c.JSON(fiber.Map{"status": "success", "message": "Transaksi berhasil dihapus"})
	})

	// =========================================
	// --- ENDPOINT STOK BARANG (INVENTORY) ---
	// =========================================

	// READ (Get All)
	app.Get("/api/inventory", func(c *fiber.Ctx) error {
		var prods []Product
		DB.Order("id desc").Find(&prods)
		return c.JSON(prods)
	})

	// CREATE (Post)
	app.Post("/api/inventory", func(c *fiber.Ctx) error {
		prod := new(Product)
		if err := c.BodyParser(prod); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Input tidak valid"})
		}
		DB.Create(&prod)
		return c.JSON(prod)
	})

	// UPDATE (Put) -> BARU
	app.Put("/api/inventory/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var prod Product
		if err := DB.First(&prod, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Produk tidak ditemukan"})
		}
		if err := c.BodyParser(&prod); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Input data edit tidak valid"})
		}
		DB.Save(&prod)
		return c.JSON(prod)
	})

	// DELETE (Delete) -> BARU
	app.Delete("/api/inventory/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var prod Product
		if err := DB.First(&prod, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Produk tidak ditemukan"})
		}
		DB.Delete(&prod)
		return c.JSON(fiber.Map{"status": "success", "message": "Produk berhasil dihapus"})
	})

	log.Fatal(app.Listen(":8080"))
}

// ===== 1. Ambil elemen dari HTML =====
const formGaji = document.getElementById("form-gaji");
const inputGaji = document.getElementById("gaji");

const formPemasukan = document.getElementById("form-pemasukan");
const inputTanggalMasuk = document.getElementById("tanggal-masuk");
const inputKeteranganMasuk = document.getElementById("keterangan-masuk");
const inputNominalMasuk = document.getElementById("nominal-masuk");

const formPengeluaran = document.getElementById("form-pengeluaran");
const inputTanggal = document.getElementById("tanggal");
const inputKeterangan = document.getElementById("keterangan");
const inputKategori = document.getElementById("kategori");
const inputNominal = document.getElementById("nominal");

const judulBulan = document.getElementById("judul-bulan");
const tombolSebelumnya = document.getElementById("bulan-sebelumnya");
const tombolBerikutnya = document.getElementById("bulan-berikutnya");

const elTampilGaji = document.getElementById("tampil-gaji");
const elTampilMasuk = document.getElementById("tampil-masuk");
const elTotal = document.getElementById("total");
const elSisa = document.getElementById("sisa");
const elPerKategori = document.getElementById("per-kategori");

const elDaftar = document.getElementById("daftar");
const elKosong = document.getElementById("kosong");
const elDaftarMasuk = document.getElementById("daftar-masuk");
const elKosongMasuk = document.getElementById("kosong-masuk");

const KUNCI = "keuangan_v2";
const KUNCI_LAMA = "pengeluaran";

// ===== 2. Fungsi bantu bulan =====
function kunciBulan(tanggal) {
    const tahun = tanggal.getFullYear();
    const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
    return tahun + "-" + bulan;
}

function namaBulan(kunci) {
    const [tahun, bulan] = kunci.split("-").map(Number);
    return new Date(tahun, bulan - 1, 1).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
    });
}

function geserBulan(kunci, n) {
    const [tahun, bulan] = kunci.split("-").map(Number);
    return kunciBulan(new Date(tahun, bulan - 1 + n, 1));
}

// ===== 3. Data =====
let semua = muatData();
let bulanAktif = kunciBulan(new Date());

function muatData() {
    try {
        const baru = localStorage.getItem(KUNCI);
        if (baru) {
            return JSON.parse(baru);
        }

        // Pindahkan data format lama (array) ke format per bulan
        const hasil = {};
        const lama = localStorage.getItem(KUNCI_LAMA);
        if (lama) {
            JSON.parse(lama).forEach(function (item) {
                const bulan = item.tanggal.slice(0, 7);
                if (!hasil[bulan]) {
                    hasil[bulan] = { gaji: 0, pemasukan: [], pengeluaran: [] };
                }
                hasil[bulan].pengeluaran.push(item);
            });
        }
        return hasil;
    } catch (error) {
        return {};
    }
}

function simpanData() {
    try {
        localStorage.setItem(KUNCI, JSON.stringify(semua));
    } catch (error) {
        alert("Data tidak bisa disimpan di browser ini.");
    }
}

// Ambil data bulan aktif (dibuat kosong kalau belum ada)
function dataBulan() {
    if (!semua[bulanAktif]) {
        semua[bulanAktif] = { gaji: 0, pemasukan: [], pengeluaran: [] };
    }
    // Data lama belum punya daftar pemasukan, jadi kita tambahkan
    if (!semua[bulanAktif].pemasukan) {
        semua[bulanAktif].pemasukan = [];
    }
    return semua[bulanAktif];
}

// ===== 4. Fungsi bantu tampilan =====
function rupiah(angka) {
    return "Rp " + angka.toLocaleString("id-ID");
}

function formatTanggal(teks) {
    return new Date(teks + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// Batasi input tanggal agar hanya bisa memilih tanggal di bulan aktif
function aturTanggal(input) {
    const [tahun, bulan] = bulanAktif.split("-").map(Number);
    const hariTerakhir = new Date(tahun, bulan, 0).getDate();

    input.min = bulanAktif + "-01";
    input.max = bulanAktif + "-" + String(hariTerakhir).padStart(2, "0");

    const hariIni = new Date();
    if (kunciBulan(hariIni) === bulanAktif) {
        input.value = hariIni.toLocaleDateString("sv-SE");
    } else {
        input.value = bulanAktif + "-01";
    }
}

function aturSemuaTanggal() {
    aturTanggal(inputTanggal);
    aturTanggal(inputTanggalMasuk);
}

// Urutkan: tanggal terbaru di atas
function urutkan(daftar) {
    return [...daftar].sort(
        (a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id
    );
}

// Membuat satu baris daftar (dipakai untuk pemasukan dan pengeluaran)
function buatBaris(judulTeks, detailTeks, nominalTeks, kelasNominal, aksiHapus) {
    const li = document.createElement("li");

    const info = document.createElement("div");
    const judul = document.createElement("strong");
    judul.textContent = judulTeks;
    const detail = document.createElement("small");
    detail.textContent = detailTeks;
    info.append(judul, document.createElement("br"), detail);

    const kanan = document.createElement("div");
    kanan.className = "kanan";
    const nominal = document.createElement("span");
    nominal.textContent = nominalTeks;
    nominal.className = kelasNominal;
    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";
    tombolHapus.className = "hapus";
    tombolHapus.addEventListener("click", aksiHapus);
    kanan.append(nominal, tombolHapus);

    li.append(info, kanan);
    return li;
}

// ===== 5. Tampilkan data ke halaman =====
function tampilkan() {
    const d = dataBulan();

    judulBulan.textContent = namaBulan(bulanAktif);
    inputGaji.value = d.gaji > 0 ? d.gaji : "";

    // Ringkasan angka
    const totalMasuk = d.pemasukan.reduce((jumlah, item) => jumlah + item.nominal, 0);
    const totalKeluar = d.pengeluaran.reduce((jumlah, item) => jumlah + item.nominal, 0);
    const sisa = d.gaji + totalMasuk - totalKeluar;

    elTampilGaji.textContent = rupiah(d.gaji);
    elTampilMasuk.textContent = rupiah(totalMasuk);
    elTotal.textContent = rupiah(totalKeluar);
    elSisa.textContent = rupiah(sisa);
    elSisa.classList.toggle("minus", sisa < 0);

    // Total pengeluaran per kategori
    const perKategori = {};
    d.pengeluaran.forEach(function (item) {
        perKategori[item.kategori] = (perKategori[item.kategori] || 0) + item.nominal;
    });

    elPerKategori.innerHTML = "";
    Object.entries(perKategori).forEach(function ([kategori, jumlah]) {
        const li = document.createElement("li");
        li.textContent = kategori + ": " + rupiah(jumlah);
        elPerKategori.append(li);
    });

    // Daftar pemasukan lain
    elDaftarMasuk.innerHTML = "";
    urutkan(d.pemasukan).forEach(function (item) {
        elDaftarMasuk.append(
            buatBaris(
                item.keterangan,
                formatTanggal(item.tanggal),
                "+ " + rupiah(item.nominal),
                "nominal-masuk",
                function () {
                    hapusPemasukan(item.id);
                }
            )
        );
    });
    elKosongMasuk.style.display = d.pemasukan.length === 0 ? "block" : "none";

    // Daftar pengeluaran
    elDaftar.innerHTML = "";
    urutkan(d.pengeluaran).forEach(function (item) {
        elDaftar.append(
            buatBaris(
                item.keterangan,
                formatTanggal(item.tanggal) + " · " + item.kategori,
                "- " + rupiah(item.nominal),
                "nominal-keluar",
                function () {
                    hapusPengeluaran(item.id);
                }
            )
        );
    });
    elKosong.style.display = d.pengeluaran.length === 0 ? "block" : "none";
}

// ===== 6. Aksi: hapus, simpan, pindah bulan =====
function hapusPengeluaran(id) {
    const d = dataBulan();
    d.pengeluaran = d.pengeluaran.filter((item) => item.id !== id);
    simpanData();
    tampilkan();
}

function hapusPemasukan(id) {
    const d = dataBulan();
    d.pemasukan = d.pemasukan.filter((item) => item.id !== id);
    simpanData();
    tampilkan();
}

formGaji.addEventListener("submit", function (event) {
    event.preventDefault();
    dataBulan().gaji = Number(inputGaji.value);
    simpanData();
    tampilkan();
});

formPemasukan.addEventListener("submit", function (event) {
    event.preventDefault();

    const item = {
        id: Date.now(),
        tanggal: inputTanggalMasuk.value,
        keterangan: inputKeteranganMasuk.value.trim(),
        nominal: Number(inputNominalMasuk.value),
    };

    if (item.keterangan === "" || item.nominal <= 0) {
        return;
    }

    dataBulan().pemasukan.push(item);
    simpanData();
    formPemasukan.reset();
    aturSemuaTanggal();
    tampilkan();
});

formPengeluaran.addEventListener("submit", function (event) {
    event.preventDefault();

    const item = {
        id: Date.now(),
        tanggal: inputTanggal.value,
        keterangan: inputKeterangan.value.trim(),
        kategori: inputKategori.value,
        nominal: Number(inputNominal.value),
    };

    if (item.keterangan === "" || item.nominal <= 0) {
        return;
    }

    dataBulan().pengeluaran.push(item);
    simpanData();
    formPengeluaran.reset();
    aturSemuaTanggal();
    tampilkan();
});

function pindahBulan(n) {
    bulanAktif = geserBulan(bulanAktif, n);
    aturSemuaTanggal();
    tampilkan();
}

tombolSebelumnya.addEventListener("click", function () {
    pindahBulan(-1);
});

tombolBerikutnya.addEventListener("click", function () {
    pindahBulan(1);
});

// ===== 7. Jalankan saat halaman dibuka =====
aturSemuaTanggal();
tampilkan();
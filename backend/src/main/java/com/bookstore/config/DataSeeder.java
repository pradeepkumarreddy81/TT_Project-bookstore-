package com.bookstore.config;

import com.bookstore.entity.*;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdminUser();
        seedCategoriesAndBooks();
    }

    private void seedAdminUser() {
        if (userRepository.count() == 0) {
            log.info("No users found. Seeding initial admin user: {}", adminEmail);

            User admin = User.builder()
                    .name("System Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);
            log.info("Admin user successfully seeded.");
        } else {
            log.info("Users table is not empty. Skipping admin seeding.");
        }
    }

    private void seedCategoriesAndBooks() {
        if (categoryRepository.count() == 0 && bookRepository.count() == 0) {
            log.info("Seeding initial 5 categories and 20 realistic books...");

            // 1. Categories
            Category tech = Category.builder()
                    .name("Technology & Programming")
                    .description("Software engineering, architecture, programming languages, and system design.")
                    .build();

            Category fiction = Category.builder()
                    .name("Fiction & Literature")
                    .description("Classic and contemporary literary fiction, timeless stories, and bestselling novels.")
                    .build();

            Category sciFi = Category.builder()
                    .name("Science Fiction & Fantasy")
                    .description("Futuristic sagas, space exploration, dystopian universes, and epic fantasy.")
                    .build();

            Category business = Category.builder()
                    .name("Business & Self-Help")
                    .description("Productivity, behavioral science, leadership, personal growth, and finance.")
                    .build();

            Category mystery = Category.builder()
                    .name("Mystery & Thriller")
                    .description("Crime investigation, psychological thrillers, suspense, and detective novels.")
                    .build();

            categoryRepository.saveAll(List.of(tech, fiction, sciFi, business, mystery));

            // 2. Books
            List<Book> books = List.of(
                    // Technology & Programming (4 books)
                    Book.builder()
                            .title("Clean Code: A Handbook of Agile Software Craftsmanship")
                            .author("Robert C. Martin")
                            .isbn("978-0132350884")
                            .description("Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. A revolutionary guide for software developers.")
                            .price(new BigDecimal("39.99"))
                            .stock(25)
                            .imageUrl("https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80")
                            .category(tech)
                            .build(),

                    Book.builder()
                            .title("The Pragmatic Programmer: Your Journey to Mastery")
                            .author("David Thomas, Andrew Hunt")
                            .isbn("978-0135957059")
                            .description("Cuts through the increasing specialization and technicalities of modern software development to examine the core process of building maintainable code.")
                            .price(new BigDecimal("44.95"))
                            .stock(30)
                            .imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80")
                            .category(tech)
                            .build(),

                    Book.builder()
                            .title("Designing Data-Intensive Applications")
                            .author("Martin Kleppmann")
                            .isbn("978-1449373320")
                            .description("An indispensable guide to the principles and practicalities of distributed data architecture, consistency, scalability, and resilience.")
                            .price(new BigDecimal("49.99"))
                            .stock(20)
                            .imageUrl("https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80")
                            .category(tech)
                            .build(),

                    Book.builder()
                            .title("Effective Java")
                            .author("Joshua Bloch")
                            .isbn("978-0134685991")
                            .description("The definitive guide to best practices in Java programming, covering idioms, pattern design, and concurrency.")
                            .price(new BigDecimal("42.50"))
                            .stock(18)
                            .imageUrl("https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80")
                            .category(tech)
                            .build(),

                    // Fiction & Literature (4 books)
                    Book.builder()
                            .title("To Kill a Mockingbird")
                            .author("Harper Lee")
                            .isbn("978-0061120084")
                            .description("A gripping, heart-wrenching story of racial injustice and compassion in the American Deep South seen through youthful eyes.")
                            .price(new BigDecimal("14.99"))
                            .stock(50)
                            .imageUrl("https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80")
                            .category(fiction)
                            .build(),

                    Book.builder()
                            .title("The Great Gatsby")
                            .author("F. Scott Fitzgerald")
                            .isbn("978-0743273565")
                            .description("The quintessential novel of the Jazz Age, exploring themes of decadence, idealism, and the illusion of the American Dream.")
                            .price(new BigDecimal("12.99"))
                            .stock(40)
                            .imageUrl("https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80")
                            .category(fiction)
                            .build(),

                    Book.builder()
                            .title("1984")
                            .author("George Orwell")
                            .isbn("978-0451524935")
                            .description("The haunting totalitarian dystopia of Big Brother, thoughtcrimes, doublespeak, and the struggle for human truth.")
                            .price(new BigDecimal("11.99"))
                            .stock(60)
                            .imageUrl("https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80")
                            .category(fiction)
                            .build(),

                    Book.builder()
                            .title("Pride and Prejudice")
                            .author("Jane Austen")
                            .isbn("978-0141439518")
                            .description("A timeless romantic masterpiece on social manners, misunderstandings, and love between Elizabeth Bennet and Mr. Darcy.")
                            .price(new BigDecimal("9.99"))
                            .stock(35)
                            .imageUrl("https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80")
                            .category(fiction)
                            .build(),

                    // Science Fiction & Fantasy (4 books)
                    Book.builder()
                            .title("Dune")
                            .author("Frank Herbert")
                            .isbn("978-0441172719")
                            .description("Set on the desert planet Arrakis, Dune tells the saga of Paul Atreides and the control of the universe's most coveted resource.")
                            .price(new BigDecimal("18.99"))
                            .stock(45)
                            .imageUrl("https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=600&q=80")
                            .category(sciFi)
                            .build(),

                    Book.builder()
                            .title("Project Hail Mary")
                            .author("Andy Weir")
                            .isbn("978-0593135204")
                            .description("A lone astronaut must solve an extinction-level crisis in an interstellar mission relying on ingenuity and science.")
                            .price(new BigDecimal("22.50"))
                            .stock(30)
                            .imageUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80")
                            .category(sciFi)
                            .build(),

                    Book.builder()
                            .title("The Hobbit")
                            .author("J.R.R. Tolkien")
                            .isbn("978-0547928227")
                            .description("The enchanting prelude to The Lord of the Rings, featuring Bilbo Baggins, Gandalf, and the quest to reclaim the Lonely Mountain.")
                            .price(new BigDecimal("15.99"))
                            .stock(50)
                            .imageUrl("https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80")
                            .category(sciFi)
                            .build(),

                    Book.builder()
                            .title("Neuromancer")
                            .author("William Gibson")
                            .isbn("978-0441569595")
                            .description("The definitive cyberpunk classic that pioneered cyberspace, artificial intelligences, and matrix hackers.")
                            .price(new BigDecimal("16.50"))
                            .stock(25)
                            .imageUrl("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80")
                            .category(sciFi)
                            .build(),

                    // Business & Self-Help (4 books)
                    Book.builder()
                            .title("Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones")
                            .author("James Clear")
                            .isbn("978-0735211292")
                            .description("Practical, actionable strategies for compound daily improvements that produce remarkable, life-changing results.")
                            .price(new BigDecimal("19.99"))
                            .stock(75)
                            .imageUrl("https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80")
                            .category(business)
                            .build(),

                    Book.builder()
                            .title("Thinking, Fast and Slow")
                            .author("Daniel Kahneman")
                            .isbn("978-0374533557")
                            .description("Nobel laureate Daniel Kahneman explains the two systems that drive our choices: fast, intuitive thinking vs slow, deliberate calculation.")
                            .price(new BigDecimal("17.50"))
                            .stock(40)
                            .imageUrl("https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80")
                            .category(business)
                            .build(),

                    Book.builder()
                            .title("Sapiens: A Brief History of Humankind")
                            .author("Yuval Noah Harari")
                            .isbn("978-0062316097")
                            .description("An astonishing exploration of how an insignificant ape became the ruler of planet Earth.")
                            .price(new BigDecimal("21.00"))
                            .stock(60)
                            .imageUrl("https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80")
                            .category(business)
                            .build(),

                    Book.builder()
                            .title("Deep Work: Rules for Focused Success in a Distracted World")
                            .author("Cal Newport")
                            .isbn("978-1455586691")
                            .description("A compelling case for how to cultivate intense focus in a world full of notifications, fragmentation, and superficial busyness.")
                            .price(new BigDecimal("18.00"))
                            .stock(35)
                            .imageUrl("https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80")
                            .category(business)
                            .build(),

                    // Mystery & Thriller (4 books)
                    Book.builder()
                            .title("The Silent Patient")
                            .author("Alex Michaelides")
                            .isbn("978-1250301696")
                            .description("A shocking psychological thriller about a woman's act of violence against her husband, and the therapist obsessed with uncovering her motive.")
                            .price(new BigDecimal("16.99"))
                            .stock(40)
                            .imageUrl("https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80")
                            .category(mystery)
                            .build(),

                    Book.builder()
                            .title("Gone Girl")
                            .author("Gillian Flynn")
                            .isbn("978-0307588371")
                            .description("A marriage torn apart by deceit, suspicion, and a sudden disappearance that turns a husband into prime suspect.")
                            .price(new BigDecimal("14.50"))
                            .stock(35)
                            .imageUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80")
                            .category(mystery)
                            .build(),

                    Book.builder()
                            .title("The Da Vinci Code")
                            .author("Dan Brown")
                            .isbn("978-0307474278")
                            .description("Symbologist Robert Langdon uncovers clues hidden in Da Vinci's paintings that lead to a centuries-old secret.")
                            .price(new BigDecimal("13.99"))
                            .stock(45)
                            .imageUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80")
                            .category(mystery)
                            .build(),

                    Book.builder()
                            .title("And Then There Were None")
                            .author("Agatha Christie")
                            .isbn("978-0062073488")
                            .description("Ten strangers are lured to an isolated island mansion off the Devon coast, where a vengeful voice accuses each of murder.")
                            .price(new BigDecimal("12.50"))
                            .stock(50)
                            .imageUrl("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80")
                            .category(mystery)
                            .build()
            );

            bookRepository.saveAll(books);
            log.info("Successfully seeded 5 categories and 20 books.");
        } else {
            log.info("Categories and Books tables already contain data. Skipping data seeding.");
        }
    }
}

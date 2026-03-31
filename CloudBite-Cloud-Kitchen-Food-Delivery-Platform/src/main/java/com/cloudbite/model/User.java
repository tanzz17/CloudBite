package com.cloudbite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user")
@TableGenerator(
        name = "user_id_generator",
        table = "id_generator",
        pkColumnName = "entity_name",
        valueColumnName = "next_id",
        pkColumnValue = "user",
        allocationSize = 1
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.TABLE, generator = "user_id_generator")
    @ToString.Include
    private Long id;

    @ToString.Include
    private String fullName;

    @ToString.Include
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private USER_ROLE role = USER_ROLE.ROLE_CUSTOMER;

    // -------------------------------
    // 🔹 RELATIONSHIPS
    // -------------------------------

    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "user_favorites",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "kitchen_id")
    )
    @ToString.Exclude
    private List<Kitchen> favorites = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private Customer customer;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "kitchen_id")
    @ToString.Exclude
    private Kitchen kitchen;
}

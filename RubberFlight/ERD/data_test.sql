SELECT * FROM ft_country;
SELECT * FROM ft_airport;

SELECT * FROM ft_user;
SELECT * FROM FT_USER;

SELECT username, password, image FROM ft_user;

SELECT * FROM ft_review;

SELECT * FROM ft_airline;
SELECT * FROM ft_reservation;
SELECT * FROM ft_flightinfo;
SELECT * FROM ft_checklist_list;
SELECT * FROM ft_checklist_item;

SELECT * FROM ft_schedule;
SELECT * FROM ft_participation;
SELECT * FROM ft_date;

SELECT * FROM ft_coupon;
SELECT * FROM FT_COUPON;
SELECT * FROM ft_coupon_users;

SELECT * FROM ft_coupon_users WHERE users_id = 1;


DESCRIBE ft_review;
DESCRIBE ft_airline;

delete from ft_user where id = 1;

delete from ft_flightinfo where id=62;

ALTER TABLE ft_flightinfo DROP COLUMN airline_iata;

UPDATE ft_reservation
SET isended = false
WHERE id = 42;

delete from ft_flightinfo
where id=14;
#
# update ft_flightinfo
# set arr_sch = "2024-08-12T14:05:00.000"
# where id=28;
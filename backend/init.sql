--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    user_id integer,
    routine_id integer,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercises (
    id integer NOT NULL,
    routine_id integer,
    name character varying(255) NOT NULL,
    duration character varying(100) NOT NULL,
    rest character varying(100) DEFAULT '0 seconds'::character varying,
    exercise_order integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.exercises OWNER TO postgres;

--
-- Name: exercises_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercises_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercises_id_seq OWNER TO postgres;

--
-- Name: exercises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercises_id_seq OWNED BY public.exercises.id;


--
-- Name: friendships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friendships (
    id integer NOT NULL,
    user_id integer,
    friend_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT friendships_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'declined'::character varying])::text[])))
);


ALTER TABLE public.friendships OWNER TO postgres;

--
-- Name: friendships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.friendships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.friendships_id_seq OWNER TO postgres;

--
-- Name: friendships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.friendships_id_seq OWNED BY public.friendships.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer,
    receiver_id integer,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    sent_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: nutrition_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nutrition_entries (
    id integer NOT NULL,
    user_id integer,
    food_name character varying(255) NOT NULL,
    quantity_grams numeric(8,2) NOT NULL,
    calories integer NOT NULL,
    protein numeric(6,2) NOT NULL,
    carbs numeric(6,2) NOT NULL,
    fat numeric(6,2) NOT NULL,
    fiber numeric(6,2) NOT NULL,
    logged_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.nutrition_entries OWNER TO postgres;

--
-- Name: nutrition_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nutrition_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nutrition_entries_id_seq OWNER TO postgres;

--
-- Name: nutrition_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nutrition_entries_id_seq OWNED BY public.nutrition_entries.id;


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ratings (
    id integer NOT NULL,
    user_id integer,
    routine_id integer,
    rating integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.ratings OWNER TO postgres;

--
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ratings_id_seq OWNER TO postgres;

--
-- Name: ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ratings_id_seq OWNED BY public.ratings.id;


--
-- Name: routine_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.routine_exercises (
    id integer NOT NULL,
    routine_id integer,
    name character varying(255) NOT NULL,
    duration character varying(50) NOT NULL,
    rest character varying(50) NOT NULL,
    exercise_order integer NOT NULL
);


ALTER TABLE public.routine_exercises OWNER TO postgres;

--
-- Name: routine_exercises_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.routine_exercises_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.routine_exercises_id_seq OWNER TO postgres;

--
-- Name: routine_exercises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.routine_exercises_id_seq OWNED BY public.routine_exercises.id;


--
-- Name: routines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.routines (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    difficulty character varying(50) NOT NULL,
    duration character varying(50) NOT NULL,
    category character varying(100) NOT NULL,
    creator_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by integer,
    CONSTRAINT routines_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['Beginner'::character varying, 'Intermediate'::character varying, 'Advanced'::character varying])::text[])))
);


ALTER TABLE public.routines OWNER TO postgres;

--
-- Name: routines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.routines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.routines_id_seq OWNER TO postgres;

--
-- Name: routines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.routines_id_seq OWNED BY public.routines.id;


--
-- Name: saved_routines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_routines (
    id integer NOT NULL,
    user_id integer,
    routine_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.saved_routines OWNER TO postgres;

--
-- Name: saved_routines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_routines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_routines_id_seq OWNER TO postgres;

--
-- Name: saved_routines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_routines_id_seq OWNED BY public.saved_routines.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    fitness_goals text[] DEFAULT '{}'::text[],
    level character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    weight_kg numeric(5,2),
    height_cm integer,
    age integer,
    gender character varying(10),
    activity_level character varying(20) DEFAULT 'moderate'::character varying,
    updated_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workout_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workout_sessions (
    id integer NOT NULL,
    user_id integer,
    routine_id integer,
    duration_minutes integer NOT NULL,
    calories_burned integer NOT NULL,
    completed_at timestamp without time zone DEFAULT now(),
    notes text
);


ALTER TABLE public.workout_sessions OWNER TO postgres;

--
-- Name: workout_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workout_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workout_sessions_id_seq OWNER TO postgres;

--
-- Name: workout_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workout_sessions_id_seq OWNED BY public.workout_sessions.id;


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: exercises id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises ALTER COLUMN id SET DEFAULT nextval('public.exercises_id_seq'::regclass);


--
-- Name: friendships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendships ALTER COLUMN id SET DEFAULT nextval('public.friendships_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: nutrition_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutrition_entries ALTER COLUMN id SET DEFAULT nextval('public.nutrition_entries_id_seq'::regclass);


--
-- Name: ratings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings ALTER COLUMN id SET DEFAULT nextval('public.ratings_id_seq'::regclass);


--
-- Name: routine_exercises id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routine_exercises ALTER COLUMN id SET DEFAULT nextval('public.routine_exercises_id_seq'::regclass);


--
-- Name: routines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routines ALTER COLUMN id SET DEFAULT nextval('public.routines_id_seq'::regclass);


--
-- Name: saved_routines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_routines ALTER COLUMN id SET DEFAULT nextval('public.saved_routines_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workout_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions ALTER COLUMN id SET DEFAULT nextval('public.workout_sessions_id_seq'::regclass);


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, user_id, routine_id, comment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercises (id, routine_id, name, duration, rest, exercise_order, created_at) FROM stdin;
\.


--
-- Data for Name: friendships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friendships (id, user_id, friend_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, receiver_id, message, is_read, sent_at) FROM stdin;
\.


--
-- Data for Name: nutrition_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nutrition_entries (id, user_id, food_name, quantity_grams, calories, protein, carbs, fat, fiber, logged_at) FROM stdin;
1	3	Brown Rice	50.00	56	1.30	11.50	0.50	0.90	2025-05-27 14:48:17.156179
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ratings (id, user_id, routine_id, rating, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: routine_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.routine_exercises (id, routine_id, name, duration, rest, exercise_order) FROM stdin;
36	11	Push-ups	30 seconds	30 seconds	0
37	11	Dumbbell Bicep Curls	45 seconds	30 seconds	1
38	11	Squats	45 seconds	30 seconds	2
39	11	Dumbbell Shoulder Press	50 seconds	30 seconds	3
40	11	Burpees	30 seconds	30 seconds	4
41	11	Plank	30-60 seconds	30 seconds	5
\.


--
-- Data for Name: routines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.routines (id, title, description, difficulty, duration, category, creator_id, created_at, updated_at, created_by) FROM stdin;
11	FitNest Classic	A Classic Workout	Intermediate	7 minutes	Full Body	\N	2025-05-27 15:07:28.541609	2025-05-27 15:07:28.541609	\N
\.


--
-- Data for Name: saved_routines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_routines (id, user_id, routine_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, fitness_goals, level, created_at, weight_kg, height_cm, age, gender, activity_level, updated_at) FROM stdin;
2	Al@gmail	$2b$10$ZYwuH5Lm17RZCUhz1i79CuE6kjYff4.QG7zTB9qNYGr3m2Arp4TKO	Al	{}	advanced	2025-05-26 11:58:48.398846	\N	\N	\N	\N	moderate	\N
3	youni@gmail	$2b$10$YcnAEpFZNorFG2bz3S75ye6wO1LoMHGlvCNWPwvKaEz6PvKY/Y1XS	younus	{}	beginner	2025-05-27 14:40:42.555325	\N	\N	\N	\N	moderate	\N
4	system@test	$2a$10$nPTwZEs9U8d.D0RjKPiyLeIt.KZCWblX8sapaAeuOWIa4/W.iF3NG	system	{}	Intermediate	2025-05-27 16:11:00.084926	\N	\N	\N	\N	moderate	2025-05-27 16:11:00.084926
\.


--
-- Data for Name: workout_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workout_sessions (id, user_id, routine_id, duration_minutes, calories_burned, completed_at, notes) FROM stdin;
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 1, true);


--
-- Name: exercises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercises_id_seq', 20, true);


--
-- Name: friendships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.friendships_id_seq', 1, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 3, true);


--
-- Name: nutrition_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nutrition_entries_id_seq', 1, true);


--
-- Name: ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ratings_id_seq', 1, true);


--
-- Name: routine_exercises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.routine_exercises_id_seq', 41, true);


--
-- Name: routines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.routines_id_seq', 26, true);


--
-- Name: saved_routines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saved_routines_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: workout_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workout_sessions_id_seq', 3, true);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);


--
-- Name: friendships friendships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_pkey PRIMARY KEY (id);


--
-- Name: friendships friendships_user_id_friend_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_user_id_friend_id_key UNIQUE (user_id, friend_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: nutrition_entries nutrition_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutrition_entries
    ADD CONSTRAINT nutrition_entries_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_user_id_routine_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_routine_id_key UNIQUE (user_id, routine_id);


--
-- Name: routine_exercises routine_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routine_exercises
    ADD CONSTRAINT routine_exercises_pkey PRIMARY KEY (id);


--
-- Name: routines routines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routines
    ADD CONSTRAINT routines_pkey PRIMARY KEY (id);


--
-- Name: saved_routines saved_routines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_routines
    ADD CONSTRAINT saved_routines_pkey PRIMARY KEY (id);


--
-- Name: saved_routines saved_routines_user_id_routine_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_routines
    ADD CONSTRAINT saved_routines_user_id_routine_id_key UNIQUE (user_id, routine_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workout_sessions workout_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_pkey PRIMARY KEY (id);


--
-- Name: idx_comments_routine_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_routine_id ON public.comments USING btree (routine_id);


--
-- Name: idx_comments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id);


--
-- Name: idx_exercises_routine_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exercises_routine_id ON public.exercises USING btree (routine_id);


--
-- Name: idx_friendships_friend_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_friendships_friend_id ON public.friendships USING btree (friend_id);


--
-- Name: idx_friendships_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_friendships_user_id ON public.friendships USING btree (user_id);


--
-- Name: idx_messages_receiver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_receiver_id ON public.messages USING btree (receiver_id);


--
-- Name: idx_messages_sender_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id);


--
-- Name: idx_messages_sent_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sent_at ON public.messages USING btree (sent_at);


--
-- Name: idx_nutrition_entries_logged_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nutrition_entries_logged_at ON public.nutrition_entries USING btree (logged_at);


--
-- Name: idx_nutrition_entries_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nutrition_entries_user_id ON public.nutrition_entries USING btree (user_id);


--
-- Name: idx_ratings_routine_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ratings_routine_id ON public.ratings USING btree (routine_id);


--
-- Name: idx_ratings_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ratings_user_id ON public.ratings USING btree (user_id);


--
-- Name: idx_routine_exercises_routine_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_routine_exercises_routine_id ON public.routine_exercises USING btree (routine_id);


--
-- Name: idx_routines_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_routines_category ON public.routines USING btree (category);


--
-- Name: idx_routines_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_routines_created_by ON public.routines USING btree (created_by);


--
-- Name: idx_routines_creator_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_routines_creator_id ON public.routines USING btree (creator_id);


--
-- Name: idx_routines_difficulty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_routines_difficulty ON public.routines USING btree (difficulty);


--
-- Name: idx_saved_routines_routine_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_routines_routine_id ON public.saved_routines USING btree (routine_id);


--
-- Name: idx_saved_routines_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_routines_user_id ON public.saved_routines USING btree (user_id);


--
-- Name: idx_workout_sessions_completed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_sessions_completed_at ON public.workout_sessions USING btree (completed_at);


--
-- Name: idx_workout_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions USING btree (user_id);


--
-- Name: comments comments_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: exercises exercises_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id) ON DELETE CASCADE;


--
-- Name: friendships friendships_friend_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: friendships friendships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: nutrition_entries nutrition_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutrition_entries
    ADD CONSTRAINT nutrition_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: routine_exercises routine_exercises_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routine_exercises
    ADD CONSTRAINT routine_exercises_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id) ON DELETE CASCADE;


--
-- Name: routines routines_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routines
    ADD CONSTRAINT routines_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: routines routines_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routines
    ADD CONSTRAINT routines_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: saved_routines saved_routines_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_routines
    ADD CONSTRAINT saved_routines_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id) ON DELETE CASCADE;


--
-- Name: saved_routines saved_routines_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_routines
    ADD CONSTRAINT saved_routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workout_sessions workout_sessions_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id) ON DELETE CASCADE;


--
-- Name: workout_sessions workout_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


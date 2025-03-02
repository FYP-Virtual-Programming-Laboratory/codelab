from sqlmodel import update

from src.events.handlers.base import AbstractLifeCycleEventHandler
from src.events.schemas import (
    GroupCreationSchema,
    SessionConfigurationCreationSchema,
    SessionCreationEventData,
    UserCreationSchema,
)
from src.models import Exercise, Group, Session, SessionConfig, TestCase, User
from src.sandbox.tasks import prune_all_containers_task


class SessionCreatedEventHandler(AbstractLifeCycleEventHandler):
    """Handler for session created events."""

    def _create_session(
        self,
        external_session_id: str,
        event_data: SessionCreationEventData,
    ) -> Session:
        """Create a new session."""

        # get lanaguage image
        session = Session(
            external_id=external_session_id,
            language_image_id=event_data.language_image_id,
            is_active=True,
        )

        config_data = (
            event_data.session_config
            if event_data.session_config
            else SessionConfigurationCreationSchema()
        )

        session_config = SessionConfig(session=session, **config_data.model_dump())

        self.db_session.add_all([session, session_config])
        self.db_session.commit()
        self.db_session.refresh(session)
        return session

    def _create_exercise(
        self, session: Session, event_data: SessionCreationEventData
    ) -> None:
        """Create exercises and its associated test cases."""
        for exercise in event_data.exercises:
            exercise_record = Exercise(
                external_id=exercise.external_id,
                session_id=session.id,
            )

            test_cases = [
                TestCase(
                    external_id=test_case.external_id,
                    exercise_id=exercise_record.id,
                    test_input=test_case.test_input,
                    visible=test_case.visible,
                )
                for test_case in exercise.test_cases
            ]

            self.db_session.add_all([exercise_record, *test_cases])

        self.db_session.commit()

    def _create_users(
        self,
        session: Session,
        user_data: list[UserCreationSchema],
        group: Group | None = None,
    ) -> list[User]:
        """Create new users."""
        users = [
            User(
                external_id=user.external_id,
                session_id=session.id,
                group_id=group.id if group else None,
            )
            for user in user_data
        ]

        self.db_session.add_all(users)
        self.db_session.commit()
        return users

    def _create_groups(
        self,
        session: Session,
        group_data: list[GroupCreationSchema],
    ) -> None:
        """Create new groups."""
        for group in group_data:
            group_record = Group(
                external_id=group.external_id,
                session_id=session.id,
            )

            users = self._create_users(
                session=session,
                user_data=group.students,
                group=group_record,
            )
            self.db_session.add_all([group_record, *users])

        self.db_session.commit()

    def handle_event(
        self,
        external_session_id: str,
        event_data: SessionCreationEventData,  # type: ignore
    ) -> None:
        """Handle the event data."""

        # first deactivate all previously active sessions for the same user (if provided)
        self.db_session.exec(
            update(Session).where(Session.is_active == True).values(is_active=False)
        )
        self.db_session.commit()

        # do not call it background as we want it to run sequentially
        prune_all_containers_task()

        # next create the new session
        session = self._create_session(external_session_id, event_data)

        # create excesises and their associated test cases
        self._create_exercise(session, event_data)

        # finally create all users and groups
        if event_data.students:
            self._create_users(session, event_data.students)

        if event_data.groups:
            self._create_groups(session, event_data.groups)


__all__ = ["SessionCreatedEventHandler"]
